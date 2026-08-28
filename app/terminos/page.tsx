export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 py-24">
      <div className="max-w-3xl mx-auto px-6 space-y-8">
        <h1 className="text-3xl font-bold text-white mb-2">Términos de Uso — Boxy</h1>
        <p className="text-zinc-500">Última actualización: 27 de Agosto de 2026</p>
        
        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">1. Qué es Boxy</h2>
          <p>
            Boxy es una plataforma de gestión (software as a service) para centros deportivos 
            y gimnasios. Boxy no es parte de la relación comercial entre el centro y sus 
            alumnos — el centro es el responsable directo de sus alumnos, sus planes, sus 
            cobros y su cumplimiento de obligaciones legales frente a ellos (incluyendo 
            consentimiento de datos de menores de edad, si corresponde).
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">2. Responsabilidad sobre los datos</h2>
          <p>
            Cada centro es responsable de la exactitud de los datos que ingresa a la 
            plataforma, incluyendo alumnos cargados manualmente o mediante importación 
            masiva (CSV).
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">3. Pagos</h2>
          <p>
            Boxy no procesa pagos ni actúa como pasarela de pago. Cualquier disputa 
            relacionada a cobros, planes o pagos se resuelve directamente entre el centro 
            y el alumno.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">4. Cuentas compartidas entre centros</h2>
          <p>
            Un mismo correo electrónico puede estar asociado a más de un centro dentro de 
            Boxy. En ese caso, el acceso del usuario está vinculado a una identidad única 
            (no son cuentas independientes) — por ejemplo, restablecer la contraseña afecta 
            el acceso a todos los centros asociados a ese correo.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">5. Disponibilidad del servicio</h2>
          <p>
            Boxy realiza sus mejores esfuerzos para mantener el servicio disponible, sin 
            garantizar disponibilidad ininterrumpida.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">6. Cookies</h2>
          <p>
            Boxy utiliza cookies necesarias para el funcionamiento de la sesión y para 
            optimizar el rendimiento (caché de información del centro).
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">7. Limitación de Responsabilidad</h2>
          <p>
            En la medida máxima permitida por la legislación aplicable en Chile, Boxy se 
            exime de cualquier responsabilidad por lucro cesante, pérdida de ingresos, pérdida 
            de datos, daños indirectos, incidentales o punitivos que escapen a su control 
            técnico razonable. Boxy provee la plataforma "tal cual" (as is) y la responsabilidad 
            indemnizatoria frente a cualquier incidente directamente atribuible a la infraestructura se limitará al equivalente 
            de lo pagado por el centro en los últimos 3 meses de servicio.
          </p>
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">8. Contacto</h2>
          <p>
            Para cualquier consulta sobre estos términos, por favor escríbenos a [hola@boxy.app] o contacta al soporte de la plataforma.
          </p>
        </section>

      </div>
    </div>
  );
}
