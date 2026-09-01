export default function SuspendedPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 bg-zinc-950 text-white">
      <div className="text-6xl">🔒</div>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Servicio temporalmente inactivo</h1>
        <p className="text-zinc-400 max-w-sm">
          Estamos teniendo problemas para procesar solicitudes en este momento. Intenta más tarde o contacta al centro.
        </p>
      </div>
    </main>
  );
}
