import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Dominio raíz de la app — cambiar en producción
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost";

// TTL del caché de tenant en el browser (cookie).
// 5 min es aceptable: los datos de org (name, slug, status) cambian rarísimo.
// Trade-off conocido y aceptado: si un super-admin suspende un centro, los usuarios
// con cookie vigente pueden seguir accediendo hasta 5 min más.
const TENANT_CACHE_TTL_SECS = 60 * 5;

// Deduplicación de requests en vuelo (Thundering Herd Coalescing).
// Si múltiples requests concurrentes fallan el caché de cookie al mismo tiempo,
// solo el primero hará el fetch real; los demás esperarán esta promesa.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const inFlightTenantRequests = new Map<string, Promise<any>>();

/**
 * Extrae el slug del subdominio a partir del hostname.
 * Ejemplos:
 *   micentro.boxy.app → "micentro"
 *   localhost:3000    → null (dominio raíz, desarrollo)
 *   boxy.app          → null (dominio raíz)
 */
function extractSlug(hostname: string): string | null {
  // En desarrollo, soportamos slug via query param ?tenant=slug para simular subdominio
  // El hostname real en prod será: slug.ROOT_DOMAIN
  const host = hostname.split(":")[0]; // eliminar puerto

  if (host === "localhost" || host === ROOT_DOMAIN) return null;

  // Verificar si es subdominio del dominio raíz
  if (host.endsWith(`.${ROOT_DOMAIN}`)) {
    const sub = host.slice(0, -(ROOT_DOMAIN.length + 1));
    // Ignorar "www" como subdominio
    if (sub === "www") return null;
    return sub || null;
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname, hostname, searchParams } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-organization-id");
  requestHeaders.delete("x-organization-slug");
  requestHeaders.delete("x-organization-name");

  // En desarrollo local Next.js puede reescribir nextUrl.hostname a localhost
  // Es más seguro extraer el hostname desde el header "host"
  const headerHost = requestHeaders.get("host") || hostname;
  
  // ── Soporte de desarrollo: ?tenant=slug simula subdominio ────────────────
  const devTenantSlug = searchParams.get("tenant");
  const slug = extractSlug(headerHost) ?? devTenantSlug;

  console.log(`[PROXY] Request: ${request.method} ${pathname} | HeaderHost: ${headerHost} | Slug: ${slug}`);

  // ── Rutas que siempre pasan sin resolución de tenant ─────────────────────
  const isManagerRoute = pathname.startsWith("/manager");
  const isRootPublic =
    !slug &&
    !isManagerRoute &&
    (pathname === "/" ||
      pathname === "/legal" ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/public") ||
      pathname.startsWith("/sentry-example-page"));

  if (isRootPublic) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Rutas del manager — solo auth, sin resolución de tenant ──────────────
  if (isManagerRoute) {
    return handleManagerAuth(request, requestHeaders, pathname);
  }

  // ── Resolución de tenant por subdominio ───────────────────────────────────
  if (!slug) {
    // Dominio raíz con ruta protegida → landing
    return NextResponse.redirect(new URL("/", request.url));
  }

  // OPTIÓN B: cachear la resolución del tenant en cookie por subdominio.
  // Elimina la cascada de fetches internos a /api/tenant/{slug} que causaba el Memory Leak
  // (~1GB/min en dev con polling de React Query en múltiples pestañas).
  //
  // Garantías de seguridad:
  // 1. httpOnly: no accesible desde JS del cliente.
  // 2. Sin `domain` explícito: browser la scopea al host exacto (bsfit.localhost ≠ centro1.localhost).
  // 3. Esta cookie es CACÉ, no autenticación. Los headers x-organization-* siguen siendo
  //    la fuente de verdad; los endpoints validan con requireAuth()/requireAdmin() contra la DB.
  // 4. Validación de slug interno para prevenir cookies copiadas entre centros.

  const tenantCookieKey = `tc_${slug}`;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let org: any = null;
  let wasCacheMiss = false;

  const cachedRaw = request.cookies.get(tenantCookieKey)?.value;
  if (cachedRaw) {
    try {
      const parsed = JSON.parse(cachedRaw);
      // Validar slug para prevenir cookie de otro centro copiada manualmente
      if (parsed?.slug === slug && parsed?.id) {
        org = parsed;
      }
    } catch {
      // Cookie corrompida o malformada → ignorar y hacer fetch fresco
    }
  }

  if (!org) {
    wasCacheMiss = true;
    
    // Deduplicación (Coalescing): si ya hay un fetch en vuelo para este slug, lo reusamos.
    if (inFlightTenantRequests.has(slug)) {
      try {
        org = await inFlightTenantRequests.get(slug);
      } catch (error) {
        return NextResponse.rewrite(new URL("/not-found", request.url));
      }
    } else {
      // No hay fetch en vuelo -> creamos uno y lo guardamos en el Map
      const fetchPromise = fetch(
        new URL(`/api/tenant/${slug}`, request.url),
        {
          headers: { "x-middleware-secret": process.env.MIDDLEWARE_SECRET ?? "" },
        }
      )
      .then(async (res) => {
        if (!res.ok) throw new Error("Tenant not found");
        return res.json();
      })
      .finally(() => {
        // Limpiar el Map sin importar si falló o fue exitoso
        inFlightTenantRequests.delete(slug);
      });

      inFlightTenantRequests.set(slug, fetchPromise);

      try {
        org = await fetchPromise;
      } catch (error) {
        // Organización no encontrada → página not-found
        return NextResponse.rewrite(new URL("/not-found", request.url));
      }
    }
  }

  // Centro suspendido → página suspendida
  if (org.status === "SUSPENDED") {
    return NextResponse.rewrite(new URL("/suspended", request.url));
  }

  // Inyectar contexto del tenant en headers
  requestHeaders.set("x-organization-id", org.id);
  requestHeaders.set("x-organization-slug", org.slug);
  requestHeaders.set("x-organization-name", org.name);

  // ── Auth del usuario en el tenant ─────────────────────────────────────────
  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data,
    error: claimsError,
  } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const user = !claimsError && claims ? claims : null;

  const isLoginRoute = pathname === "/login";
  const isProtectedRoute =
    pathname.startsWith("/alumnos") || pathname.startsWith("/hub");

  // Sin sesión → redirigir a login del tenant
  if (!user && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Con sesión → redirigir desde login según rol
  if (user && isLoginRoute) {
    const role = user.app_metadata?.role as string | undefined;
    if (role) requestHeaders.set("x-user-role", role.toLowerCase());
    
    if (role === "ADMIN" || role === "COACH") {
      return NextResponse.redirect(new URL("/hub", request.url));
    }
    return NextResponse.redirect(new URL("/alumnos", request.url));
  }

  // Setear x-user-role siempre si hay usuario
  if (user) {
    const role = user.app_metadata?.role as string | undefined;
    if (role) requestHeaders.set("x-user-role", role.toLowerCase());
  }

  // Proteger /hub — solo ADMIN y COACH
  if (user && pathname.startsWith("/hub")) {
    const role = user.app_metadata?.role as string | undefined;
    if (role !== "ADMIN" && role !== "COACH") {
      return NextResponse.redirect(new URL("/alumnos", request.url));
    }
  }

  // Redirigir la raíz del tenant (/) a su dashboard correspondiente
  if (pathname === "/") {
    console.log(`[PROXY] Hit root path with user: ${!!user}`);
    if (!user) {
      console.log(`[PROXY] Redirecting to /login`);
      return NextResponse.redirect(new URL("/login", request.url));
    } else {
      const role = user.app_metadata?.role as string | undefined;
      console.log(`[PROXY] User role: ${role}`);
      if (role === "ADMIN" || role === "COACH") {
        return NextResponse.redirect(new URL("/hub", request.url));
      }
      return NextResponse.redirect(new URL("/alumnos", request.url));
    }
  }

  // Evitar que ADMIN/COACH entren a /alumnos
  if (user && pathname.startsWith("/alumnos")) {
    const role = user.app_metadata?.role as string | undefined;
    if (role === "ADMIN" || role === "COACH") {
      return NextResponse.redirect(new URL("/hub", request.url));
    }
  }

  // Respuesta final con headers de tenant + cookies de Supabase
  const finalResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value);
  });

  // Escribir cookie de caché de tenant solo en cache miss.
  // Sin `domain` explícito → browser scopea al host exacto (bsfit.localhost ≠ centro1.localhost).
  if (wasCacheMiss) {
    finalResponse.cookies.set(
      tenantCookieKey,
      JSON.stringify({ id: org.id, slug: org.slug, name: org.name, status: org.status }),
      {
        httpOnly: true,
        sameSite: "lax",
        maxAge: TENANT_CACHE_TTL_SECS,
        path: "/",
        // domain: no se setea → scopeado exacto al subdominio emisor
      }
    );
  }

  return finalResponse;
}

const CRON_ROUTES = new Set(["/manager/api/cron/billing"]);

/** Maneja auth para las rutas /manager sin contexto de tenant */
async function handleManagerAuth(
  request: NextRequest,
  requestHeaders: Headers,
  pathname: string
) {
  if (pathname === "/manager/login" || CRON_ROUTES.has(pathname)) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data,
    error: claimsError,
  } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const user = !claimsError && claims ? claims : null;

  if (!user) {
    return NextResponse.redirect(new URL("/manager/login", request.url));
  }

  const isManager = user.app_metadata?.isManager === true;
  if (!isManager) {
    return NextResponse.redirect(new URL("/manager/login", request.url));
  }

  const finalResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value);
  });

  return finalResponse;
}

export const config = {
  matcher: [
    /*
     * Excluir archivos estáticos de Next.js y rutas internas.
     * Incluir todo lo demás para la resolución de tenant.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
