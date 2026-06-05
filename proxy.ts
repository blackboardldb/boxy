import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Dominio raíz de la app — cambiar en producción
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost";

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
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api/") ||
      pathname.startsWith("/favicon") ||
      pathname.startsWith("/public"));

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

  // Consultar la organización en DB via API interna para no usar Prisma en edge
  const orgResponse = await fetch(
    new URL(`/api/tenant/${slug}`, request.url),
    {
      headers: { "x-middleware-secret": process.env.MIDDLEWARE_SECRET ?? "" },
    }
  );

  if (!orgResponse.ok) {
    // Organización no encontrada → página not-found
    return NextResponse.rewrite(new URL("/not-found", request.url));
  }

  const org = await orgResponse.json();

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
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginRoute = pathname === "/login";
  const isProtectedRoute =
    pathname.startsWith("/alumnos") || pathname.startsWith("/centros");

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
      return NextResponse.redirect(new URL("/centros", request.url));
    }
    return NextResponse.redirect(new URL("/alumnos", request.url));
  }

  // Setear x-user-role siempre si hay usuario
  if (user) {
    const role = user.app_metadata?.role as string | undefined;
    if (role) requestHeaders.set("x-user-role", role.toLowerCase());
  }

  // Proteger /centros — solo ADMIN y COACH
  if (user && pathname.startsWith("/centros")) {
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
        return NextResponse.redirect(new URL("/centros", request.url));
      }
      return NextResponse.redirect(new URL("/alumnos", request.url));
    }
  }

  // Evitar que ADMIN/COACH entren a /alumnos
  if (user && pathname.startsWith("/alumnos")) {
    const role = user.app_metadata?.role as string | undefined;
    if (role === "ADMIN" || role === "COACH") {
      return NextResponse.redirect(new URL("/centros", request.url));
    }
  }

  // Respuesta final con headers de tenant + cookies de Supabase
  const finalResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value);
  });

  return finalResponse;
}

/** Maneja auth para las rutas /manager sin contexto de tenant */
async function handleManagerAuth(
  request: NextRequest,
  requestHeaders: Headers,
  pathname: string
) {
  if (pathname === "/manager/login") {
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
    data: { user },
  } = await supabase.auth.getUser();

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
