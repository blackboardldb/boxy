import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Boxy — Plataforma para centros deportivos",
  description:
    "Gestiona tu centro deportivo con Boxy. Clases, alumnos, pagos y más en una sola plataforma.",
};

export default function RootLandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between border-b border-zinc-900">
        <span className="font-mono font-bold text-xl tracking-tight">
          BOXY
        </span>
        <a
          href="/manager/login"
          className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
        >
          Manager →
        </a>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center gap-8">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-2">
            Plataforma SaaS · Multi-tenant
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            Tu centro.
            <br />
            <span className="text-indigo-400">Tu plataforma.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-lg mx-auto">
            Boxy le da a cada centro deportivo su propio espacio digital —
            con clases, alumnos, pagos y un diseño completamente personalizado.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <a
            href="mailto:hola@boxy.app"
            className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 transition-colors font-semibold text-sm"
          >
            ¿Eres un centro? Contáctanos
          </a>
          <div className="text-zinc-500 text-sm px-4 py-3 rounded-xl border border-zinc-800 max-w-xs text-center">
            ¿Eres alumno? Accede desde la URL de tu centro:
            <br />
            <code className="text-zinc-400 font-mono text-xs">tucentro.boxy.app</code>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {[
            "🗓️ Clases y horarios",
            "👥 Gestión de alumnos",
            "💳 Control de pagos",
            "🎨 Marca propia",
            "📱 PWA nativa",
            "🔒 Multi-tenant seguro",
          ].map((f) => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs"
            >
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-600">
        <span>© {new Date().getFullYear()} Boxy</span>
        <a
          href="/manager/login"
          className="hover:text-zinc-400 transition-colors"
        >
          Acceso manager
        </a>
      </footer>
    </main>
  );
}
