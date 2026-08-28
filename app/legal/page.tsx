import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Legal y Privacidad — Boxy",
};

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between border-b border-zinc-900">
        <a href="/" className="font-mono font-bold text-xl tracking-tight text-white hover:text-indigo-400 transition-colors">
          BOXY
        </a>
        <a
          href="mailto:hola@boxy.app"
          className="text-zinc-400 hover:text-white transition-colors text-sm font-medium bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-full border border-zinc-800"
        >
          Contáctanos
        </a>
      </nav>

      <div className="flex-1 py-12 px-6">
        <div className="max-w-3xl mx-auto space-y-12">
        <header className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Legal y Privacidad</h1>
          <p className="text-zinc-400 font-mono text-sm">Última actualización: Agosto 2026</p>
        </header>

        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-200">1. Naturaleza del Servicio (B2B)</h2>
            <p className="text-zinc-400 leading-relaxed">
              Boxy es una plataforma de software como servicio (SaaS) diseñada exclusivamente para operar bajo un modelo B2B (Business-to-Business). Proveemos la infraestructura tecnológica y de software para que centros deportivos, academias y gimnasios gestionen sus propias operaciones. 
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-200">2. Privacidad y Tratamiento de Datos Personales</h2>
            <p className="text-zinc-400 leading-relaxed">
              En el contexto de las leyes de protección de datos vigentes (incluyendo la legislación aplicable en Chile), <strong>el centro deportivo actúa en todo momento como el Responsable Legal del Tratamiento de Datos</strong>. Boxy opera estrictamente bajo el rol de Encargado del Tratamiento.
            </p>
            <ul className="list-disc list-inside text-zinc-400 leading-relaxed space-y-3 mt-4">
              <li>
                <strong className="text-zinc-300">Propiedad de los datos:</strong> Cada centro es el dueño único y responsable legal de la información que recolecta e ingresa sobre sus alumnos (nombres, correos, teléfonos, fechas de nacimiento, contactos de emergencia).
              </li>
              <li>
                <strong className="text-zinc-300">Privacidad estricta:</strong> Boxy no accede, no perfila y bajo ninguna circunstancia comercializa los datos personales de los alumnos. El equipo de Boxy no revisa información personal identificable (PII).
              </li>
              <li>
                <strong className="text-zinc-300">Mantenimiento técnico:</strong> El acceso excepcional a la base de datos por parte de nuestro equipo de ingeniería se limita estrictamente a tareas críticas de mantenimiento técnico, corrección de errores (debugging) o soporte solicitado explícitamente por el centro.
              </li>
              <li>
                <strong className="text-zinc-300">Uso de métricas:</strong> Boxy únicamente utiliza métricas de uso agregadas y anonimizadas (ej. cantidad de centros, volumen de procesamiento, contadores de uso) para el mantenimiento y mejora de la plataforma tecnológica.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-200">3. Menores de Edad y Consentimiento</h2>
            <p className="text-zinc-400 leading-relaxed">
              Dada la naturaleza de los centros deportivos, es frecuente el registro de alumnos menores de edad en la plataforma. <strong>Es responsabilidad exclusiva y legal del centro deportivo</strong> obtener, gestionar y documentar el consentimiento explícito de los padres o tutores legales antes de ingresar cualquier dato de un menor de edad a la infraestructura de Boxy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-200">4. Contacto y Soporte</h2>
            <p className="text-zinc-400 leading-relaxed">
              Si eres un alumno y tienes dudas sobre tus datos, debes contactar directamente a la administración de tu centro deportivo (el responsable de los mismos). 
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Para consultas institucionales, comerciales o técnicas de los administradores de los centros dirigidas hacia la infraestructura de Boxy, puedes escribirnos a <a href="mailto:hola@boxy.app" className="text-indigo-400 hover:text-indigo-300 transition-colors">hola@boxy.app</a>.
            </p>
          </section>
        </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
        <span>© {new Date().getFullYear()} Boxy</span>
        <div className="flex gap-4">
          <a href="/legal" className="hover:text-zinc-400 transition-colors">Legal y Privacidad</a>
          <a href="/terminos" className="hover:text-zinc-400 transition-colors">Términos de Uso</a>
        </div>
      </footer>
    </main>
  );
}
