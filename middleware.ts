import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  // Respuesta temporal para que Supabase pueda setear cookies si necesita refrescar sesión
  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Validar token criptográficamente contra el servidor de Supabase Auth.
  // getUser() es más seguro que getSession() — autentica el token en vez de solo leerlo.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 1. Sin sesión → redirigir a /login si intenta acceder a zonas protegidas
  if (!user && (pathname.startsWith("/app") || pathname.startsWith("/admin"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Con sesión → Manejo de roles y redirecciones
  if (user) {
    const isRootRoute = pathname === "/";
    const isLoginRoute = pathname === "/login";
    const isAdminRoute = pathname.startsWith("/admin");
    const isAppRoute = pathname.startsWith("/app");

    // Solo consultar el rol si estamos en rutas que dependen de él
    if (isRootRoute || isLoginRoute || isAdminRoute || isAppRoute) {
      // Leer el rol desde app_metadata — siempre presente gracias al trigger SQL.
      // No se realiza ninguna consulta a la base de datos en el middleware.
      const role = user.app_metadata?.role as string | undefined;

      // Pasar el rol en un header para no tener que consultarlo de nuevo en el layout
      if (role) {
        requestHeaders.set('x-user-role', role);
      }

      // --- Lógica de Redirecciones ---

      // Z. Redirección desde root si ya hay sesión activa
      if (isRootRoute) {
        if (role === "admin" || role === "coach") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.redirect(new URL("/app", request.url));
      }

      // A. Redirección desde login
      if (isLoginRoute) {
        if (role === "admin" || role === "coach") {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
        return NextResponse.redirect(new URL("/app", request.url));
      }

      // B. Proteger zona administrativa (solo admin y coach)
      if (isAdminRoute && role !== "admin" && role !== "coach") {
        return NextResponse.redirect(new URL("/app", request.url));
      }

      // C. Evitar que personal de gestión entre a la zona de alumnos
      if (isAppRoute && (role === "admin" || role === "coach")) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  // 3. Crear la respuesta final con los headers actualizados
  const finalResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Copiar cualquier cookie que Supabase haya refrescado en la respuesta temporal
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    finalResponse.cookies.set(cookie.name, cookie.value);
  });

  return finalResponse;
}

export const config = {
  matcher: [
    "/",
    "/app/:path*",
    "/admin/:path*",
    "/login",
  ],
};
