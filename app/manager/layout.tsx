import { requireManager } from "@/lib/auth/require-manager";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireManager();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center gap-3">
        <span className="font-mono font-bold text-lg tracking-tight">
          BOXY <span className="text-zinc-500 font-normal">manager</span>
        </span>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
