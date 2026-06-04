export default function SuspendedPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 bg-zinc-950 text-white">
      <div className="text-6xl">🔒</div>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Centro suspendido</h1>
        <p className="text-zinc-400 max-w-sm">
          Este centro está temporalmente suspendido. Si crees que es un error,
          comunícate con el soporte de Boxy.
        </p>
      </div>
      <a
        href="mailto:soporte@boxy.app"
        className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm"
      >
        Contactar soporte
      </a>
    </main>
  );
}
