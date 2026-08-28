export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col">
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

      <div className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white">TÉRMINOS DE USO Y POLÍTICA DE PRIVACIDAD — Boxy</h1>
            <p className="text-zinc-500">Última actualización: 27 de Agosto de 2026</p>
            <p className="text-zinc-500 text-sm">
              Al utilizar la plataforma Boxy, el Centro (definido más adelante) acepta íntegramente los presentes términos y condiciones, los cuales se rigen por la legislación de la República de Chile.
            </p>
          </div>

          {/* SECCION 1 */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">1. Definiciones y Naturaleza del Servicio</h2>
            <div className="space-y-3 text-sm">
              <p>
                <strong className="text-white">1.1. Boxy:</strong> Plataforma de gestión (software as a service) que proporciona herramientas digitales para la administración de centros deportivos, gimnasios y espacios de entrenamiento funcional.
              </p>
              <p>
                <strong className="text-white">1.2. Centro:</strong> Persona natural o jurídica, gimnasio, box de CrossFit, estudio de entrenamiento funcional o similar, que contrata y utiliza la plataforma Boxy para gestionar sus operaciones, alumnos y clases.
              </p>
              <p>
                <strong className="text-white">1.3. Alumno:</strong> Usuario final (cliente del Centro) que reserva clases, consulta horarios o interactúa con las funcionalidades habilitadas por el Centro a través de Boxy.
              </p>
              <p>
                <strong className="text-white">1.4. Naturaleza del servicio:</strong> Boxy actúa únicamente como proveedor de tecnología. No es parte de la relación comercial entre el Centro y sus Alumnos, ni asume responsabilidad por los servicios de entrenamiento, cobros, planes o cumplimiento de obligaciones legales que correspondan al Centro.
              </p>
            </div>
          </section>

          {/* SECCION 2 */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">2. Relación Contractual y Responsabilidades</h2>
            <div className="space-y-3">
              <p>
                <strong className="text-white">2.1. Relación Boxy-Centro:</strong> El contrato de prestación de servicios se celebra exclusivamente entre Boxy y el Centro. El Centro es el único responsable frente a sus Alumnos por la calidad del servicio de entrenamiento, cobros, facturación, reembolsos y cumplimiento de la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.
              </p>
              <p>
                <strong className="text-white">2.2. Responsabilidad sobre datos:</strong> El Centro es único responsable de la exactitud, veracidad y legalidad de los datos que ingresa a la plataforma, incluyendo alumnos cargados manualmente o mediante importación masiva (CSV). Boxy no verifica ni valida la información proporcionada por el Centro.
              </p>
              <p>
                <strong className="text-white">2.3. Cuentas compartidas:</strong> Un mismo correo electrónico puede estar asociado a más de un Centro dentro de Boxy. En ese caso, el acceso del usuario está vinculado a una identidad única: restablecer la contraseña afecta el acceso a todos los Centros asociados a ese correo.
              </p>
              <p>
                <strong className="text-white">2.4. Múltiples administradores:</strong> El Centro puede habilitar múltiples usuarios o administradores dentro de su cuenta. El Centro es responsable de la gestión de credenciales, permisos y acciones realizadas por dichos usuarios.
              </p>
            </div>
          </section>

          {/* SECCION 3 */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">3. Datos Personales y Privacidad</h2>
            <div className="space-y-3">
              <p>
                <strong className="text-white">3.1. Marco legal:</strong> El tratamiento de datos personales se rige por la Ley N° 19.628 sobre Protección de la Vida Privada y sus modificaciones.
              </p>
              <p>
                <strong className="text-white">3.2. Datos almacenados:</strong> Boxy almacena únicamente datos necesarios para la operación de la plataforma: nombre (o sobrenombre), correo electrónico, y datos de uso de la plataforma. <strong className="text-white">No se almacenan RUT completos, fotos, videos, condiciones médicas, lesiones ni datos sensibles.</strong>
              </p>
              <p>
                <strong className="text-white">3.3. Menores de edad:</strong> Boxy permite que los Centros carguen datos de menores de edad (ej. alumnos entre 15 y 17 años) únicamente para gestión de reservas de clases. El Centro declara que cuenta con el consentimiento del padre o apoderado para dicho tratamiento de datos. Al momento de crear la cuenta y dar de alta al administrador, se asume que este cuenta con las autorizaciones necesarias.
              </p>
              <p>
                <strong className="text-white">3.4. Finalidad del tratamiento:</strong> Los datos se utilizan exclusivamente para: (a) permitir la reserva de clases, (b) gestión de asistencia, (c) comunicación entre Centro y Alumno, y (d) optimización del servicio.
              </p>
              <p>
                <strong className="text-white">3.5. Datos agregados:</strong> Boxy se reserva el derecho de utilizar datos agregados y anónimos (ej. estadísticas macro de género, preferencias de pago por transferencia, etc.) para mejorar el servicio, sin que esto permita identificar Centros, Alumnos, marcas o instituciones financieras específicas.
              </p>
              <p>
                <strong className="text-white">3.6. Derechos del titular:</strong> De conformidad con la Ley N° 19.628, los titulares de datos personales pueden solicitar al Centro el acceso, modificación o bloqueo de sus datos. Boxy facilitará al Centro las herramientas para atender estas solicitudes dentro de la plataforma.
              </p>
              <p>
                <strong className="text-white">3.7. Cookies:</strong> Boxy utiliza cookies necesarias para el funcionamiento de la sesión y para optimizar el rendimiento (caché de información del Centro). No se utilizan cookies de terceros para publicidad o seguimiento.
              </p>
              <p>
                <strong className="text-white">3.8. Seguridad:</strong> Boxy implementa medidas técnicas y organizativas razonables para proteger los datos contra acceso no autorizado, pérdida o destrucción. Sin embargo, ninguna transmisión por Internet es completamente segura, por lo que el Centro reconoce que existe un riesgo inherente.
              </p>
            </div>
          </section>

          {/* SECCION 4 */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">4. Propiedad Intelectual</h2>
            <div className="space-y-3">
              <p>
                <strong className="text-white">4.1. Contenido del Centro:</strong> Todo contenido que el Centro suba a la plataforma (logos, nombres de planes, rutinas, descripciones, horarios, etc.) pertenece exclusiva e íntegramente al Centro. Boxy no adquiere derechos de propiedad sobre dicho contenido.
              </p>
              <p>
                <strong className="text-white">4.2. Licencia de uso:</strong> El Centro otorga a Boxy una licencia no exclusiva, intransferible y revocable para utilizar, mostrar y almacenar dicho contenido únicamente con el fin de operar la plataforma y prestar el servicio contratado.
              </p>
              <p>
                <strong className="text-white">4.3. Plataforma Boxy:</strong> El software, diseño, interfaz, código, marcas y elementos distintivos de Boxy son propiedad exclusiva de Boxy y están protegidos por las leyes de propiedad intelectual de Chile y tratados internacionales. Queda prohibida su reproducción, distribución o uso sin autorización expresa.
              </p>
            </div>
          </section>

          {/* SECCION 5 */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">5. Pagos y Facturación</h2>
            <div className="space-y-3">
              <p>
                <strong className="text-white">5.1. Boxy no procesa pagos:</strong> La plataforma no actúa como pasarela de pago ni procesa transacciones entre Centros y Alumnos. Cualquier disputa relacionada a cobros, planes, pagos o reembolsos se resuelve directamente entre el Centro y el Alumno.
              </p>
              <p>
                <strong className="text-white">5.2. Suscripción del Centro:</strong> El Centro paga a Boxy una suscripción por el uso de la plataforma, cuyos valores, planes y límites se informan antes de la contratación.
              </p>
              <p>
                <strong className="text-white">5.3. Límites de uso:</strong> Cada plan puede tener límites de uso (ej. número máximo de alumnos) que pueden variar anualmente. Boxy informará con anticipación razonable cualquier cambio en estos límites.
              </p>
              <p>
                <strong className="text-white">5.4. Períodos de prueba y promociones:</strong> Boxy puede ofrecer períodos de prueba o condiciones comerciales especiales de forma privada, sin exposición pública. Estos acuerdos se regirán por lo pactado entre las partes.
              </p>
            </div>
          </section>

          {/* SECCION 6 */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">6. Uso Aceptable y Prohibiciones</h2>
            <div className="space-y-3">
              <p>
                <strong className="text-white">6.1. Uso aceptable:</strong> El Centro se compromete a utilizar la plataforma únicamente para fines lícitos, relacionados con la gestión de su centro deportivo o gimnasio.
              </p>
              <p>
                <strong className="text-white">6.2. Prohibiciones expresas:</strong> Queda estrictamente prohibido:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-zinc-400">
                <li>Utilizar la plataforma para actividades ilegales o contrarias a la moral y las buenas costumbres.</li>
                <li>Vender, arrendar o ceder el espacio o la cuenta a terceros para lucrar.</li>
                <li>Vender, compartir o comercializar datos de Alumnos.</li>
                <li>Realizar ingeniería inversa, descompilación, scraping o intentos de vulnerabilidad sobre la plataforma.</li>
                <li>Compartir credenciales de acceso de forma negligente o maliciosa.</li>
                <li>Utilizar los datos de Alumnos para spam, marketing no autorizado o fines distintos a la gestión de clases.</li>
                <li>Intentar acceder a cuentas, datos o funcionalidades de otros Centros o Alumnos sin autorización.</li>
              </ul>
              <p>
                <strong className="text-white">6.3. Sanciones:</strong> El incumplimiento de estas prohibiciones faculta a Boxy para suspender o terminar la cuenta de forma inmediata y categórica, sin derecho a reembolso, y sin perjuicio de las acciones legales que correspondan. Boxy informará a los Alumnos afectados por medios formales cuando corresponda.
              </p>
            </div>
          </section>

          {/* SECCION 7 */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">7. Suspensión y Terminación del Servicio</h2>
            <div className="space-y-3">
              <p>
                <strong className="text-white">7.1. Suspensión o terminación por Boxy:</strong> Boxy podrá suspender o cerrar la cuenta de un Centro sin previo aviso en los siguientes casos:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-zinc-400">
                <li>Venta o cesión del espacio a terceros para lucrar.</li>
                <li>Venta, uso malicioso o comercialización de datos de Alumnos.</li>
                <li>Intentos de ingeniería inversa, scraping o vulneración de la seguridad.</li>
                <li>Actividad fraudulenta o uso de la plataforma para fines ilegales.</li>
                <li>Inactividad prolongada sin uso de la plataforma.</li>
                <li>Impago de la suscripción por más de 30 días corridos.</li>
              </ul>
              <p>
                <strong className="text-white">7.2. Terminación por el Centro:</strong> El Centro puede dejar de utilizar la plataforma en cualquier momento. En caso de cierre voluntario, se recomienda exportar los datos previamente (ver sección 8).
              </p>
              <p>
                <strong className="text-white">7.3. Efectos de la terminación:</strong> Una vez terminada la cuenta, el Centro perderá el acceso a la plataforma, pero sus datos se mantendrán almacenados por un período de 6 a 12 meses (a discreción de Boxy) para permitir una eventual reactivación. Transcurrido ese período, los datos serán purgados de forma definitiva e irreversible.
              </p>
            </div>
          </section>

          {/* SECCION 8 */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">8. Exportación y Eliminación de Datos</h2>
            <div className="space-y-3">
              <p>
                <strong className="text-white">8.1. Derecho a exportar:</strong> El Centro puede exportar sus datos (listado de Alumnos, registros financieros, etc.) en formato CSV u otros formatos habilitados por la plataforma, en cualquier momento mientras su cuenta está activa.
              </p>
              <p>
                <strong className="text-white">8.2. Eliminación definitiva:</strong> Transcurrido el período de resguardo (6-12 meses desde la terminación), los datos serán eliminados de forma permanente de los servidores de Boxy, sin posibilidad de recuperación.
              </p>
              <p>
                <strong className="text-white">8.3. Recomendación:</strong> Se recomienda al Centro realizar una exportación completa de sus datos antes de solicitar el cierre definitivo de su cuenta.
              </p>
            </div>
          </section>

          {/* SECCION 9 */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">9. Disponibilidad del Servicio</h2>
            <div className="space-y-3">
              <p>
                <strong className="text-white">9.1. Esfuerzos razonables:</strong> Boxy realiza sus mejores esfuerzos para mantener el servicio disponible, pero no garantiza disponibilidad ininterrumpida, libre de errores o exenta de interrupciones por mantenimiento, actualizaciones o causas fuera de su control razonable.
              </p>
              <p>
                <strong className="text-white">9.2. Mantenimiento:</strong> Boxy podrá realizar interrupciones programadas por mantenimiento o actualizaciones, informando con anticipación razonable cuando sea técnicamente posible.
              </p>
            </div>
          </section>

          {/* SECCION 10 */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">10. Modificación de los Términos</h2>
            <div className="space-y-3">
              <p>
                <strong className="text-white">10.1. Facultad de modificación:</strong> Boxy se reserva el derecho de modificar estos Términos de Uso y Política de Privacidad en cualquier momento, especialmente para incorporar nuevas funcionalidades o adecuarlos a cambios normativos.
              </p>
              <p>
                <strong className="text-white">10.2. Notificación:</strong> Boxy informará a los Centros con al menos 30 días de anticipación cuando las modificaciones sean sustanciales. Las modificaciones entrarán en vigencia una vez publicadas en la plataforma.
              </p>
              <p>
                <strong className="text-white">10.3. Aceptación:</strong> La continuación en el uso de la plataforma después de la publicación de las modificaciones implica la aceptación íntegra de los nuevos términos. En caso de no aceptarlas, el Centro podrá solicitar la terminación de su cuenta antes de la fecha de vigencia.
              </p>
            </div>
          </section>

          {/* SECCION 11 */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">11. Limitación de Responsabilidad</h2>
            <div className="space-y-3">
              <p>
                <strong className="text-white">11.1. Exención de responsabilidad:</strong> En la medida máxima permitida por la legislación aplicable en Chile, Boxy se exime de cualquier responsabilidad por lucro cesante, pérdida de ingresos, pérdida de datos, daños indirectos, incidentales, punitivos o consecuentes que escapen a su control técnico razonable.
              </p>
              <p>
                <strong className="text-white">11.2. Servicio &quot;tal cual&quot;:</strong> La plataforma se proporciona &quot;tal cual&quot; (<em>as is</em>), sin garantías expresas o implícitas de comerciabilidad, idoneidad para un propósito particular o no infracción.
              </p>
              <p>
                <strong className="text-white">11.3. Límite indemnizatorio:</strong> La responsabilidad indemnizatoria de Boxy frente a cualquier incidente directamente atribuible a su infraestructura técnica se limitará al equivalente de lo pagado por el Centro en los últimos 3 (tres) meses de servicio.
              </p>
              <p>
                <strong className="text-white">11.4. Fuerza mayor:</strong> Boxy no será responsable por interrupciones o fallas causadas por eventos fuera de su control razonable, incluyendo pero no limitado a: fallas de Internet, proveedores de hosting, desastres naturales, actos de autoridad, huelgas, o ataques cibernéticos.
              </p>
            </div>
          </section>

          {/* SECCION 12 */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">12. Disposiciones Finales</h2>
            <div className="space-y-3">
              <p>
                <strong className="text-white">12.1. Ley aplicable:</strong> Estos Términos se rigen e interpretan de conformidad con las leyes de la República de Chile, en especial la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores, la Ley N° 19.628 sobre Protección de la Vida Privada, y la Ley N° 19.799 sobre Documentos Electrónicos y Firma Electrónica.
              </p>
              <p>
                <strong className="text-white">12.2. Jurisdicción:</strong> Cualquier controversia derivada de estos términos será sometida a los tribunales ordinarios de justicia de Santiago, Región Metropolitana, renunciando las partes a cualquier otro fuero que pudiera corresponderles.
              </p>
              <p>
                <strong className="text-white">12.3. Validez de cláusulas:</strong> Si alguna cláusula de estos términos fuera declarada nula, inválida o inaplicable por autoridad competente, las demás cláusulas mantendrán plena vigencia y validez.
              </p>
              <p>
                <strong className="text-white">12.4. No renuncia:</strong> La tolerancia o inacción de Boxy frente a cualquier incumplimiento del Centro no constituirá renuncia a sus derechos ni validará dicho incumplimiento.
              </p>
              <p>
                <strong className="text-white">12.5. Idioma:</strong> Estos términos están redactados en idioma español. Cualquier traducción a otros idiomas se proporciona únicamente por conveniencia y no modifica el contenido original.
              </p>
            </div>
          </section>

          {/* SECCION 13 - Contacto */}
          <section className="space-y-4">
            <h2 className="text-xl font-medium text-white border-b border-zinc-800 pb-2">13. Contacto</h2>
            <div className="space-y-3">
              <p>
                Para cualquier consulta sobre estos términos, política de privacidad, ejercicio de derechos sobre datos personales o soporte técnico, por favor escríbanos a:
              </p>
              <p className="text-white font-medium">
                ✉️ hola@boxy.app
              </p>
              <p className="text-zinc-500 text-sm">
                O contacte al soporte de la plataforma a través de los canales habilitados dentro de la aplicación.
              </p>
            </div>
          </section>

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
    </div>
  );
}
