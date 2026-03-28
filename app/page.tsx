import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default function Page() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="p-4 max-w-4xl mx-auto text-white space-y-3 flex flex-col items-center">
        <Logo size={240} />
        <Link href="/login" className="w-full">
          <Button className="w-full bg-lime-400 hover:bg-lime-500 text-black font-bold py-6 rounded-xl text-lg transition-all" variant={"default"}>
            <span>Ir a mi cuenta</span>
          </Button>
        </Link>
      </div>
    </main>
  );
}
