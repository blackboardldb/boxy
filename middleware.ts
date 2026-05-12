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

  // Refrescar sesión (importante para mantener tokens válidos)
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
    const isLoginRoute = pathname === "/login";
    const isAdminRoute = pathname.startsWith("/admin");
    const isAppRoute = pathname.startsWith("/app");

    // Solo consultar el rol si estamos en rutas que dependen de él
    if (isLoginRoute || isAdminRoute || isAppRoute) {
      // 1. Intentar obtener el rol de los metadatos (rápido y evita RLS)
      let role = (user.app_metadata?.role as string) || (user.user_metadata?.role as string);

      // 2. Si no hay rol en metadatos, consultar la tabla profiles
      if (!role) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        role = profile?.role;
      }

      // Pasar el rol en un header para no tener que consultarlo de nuevo en el layout
      if (role) {
        requestHeaders.set('x-user-role', role);
      }

      // --- Lógica de Redirecciones ---

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
    "/app/:path*",
    "/admin/:path*",
    "/login",
  ],
};
