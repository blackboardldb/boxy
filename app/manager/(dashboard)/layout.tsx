import { requireManager } from "@/lib/auth/require-manager";
import Link from "next/link";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireManager();

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/manager" className="font-mono font-bold text-lg tracking-tight hover:opacity-80">
            BOXY <span className="text-zinc-500 font-normal">manager</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-zinc-400">
            <Link href="/manager" className="hover:text-white transition-colors">Centros</Link>
            <Link href="/manager/planes" className="hover:text-white transition-colors">Planes</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
