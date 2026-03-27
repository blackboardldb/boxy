"use client";

import { UserProfile } from "@/components/user-profile";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      setIsLoggingOut(false);
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <section className="p-4 mx-auto space-y-6 max-w-4xl pb-28">
        <UserProfile />
        <Button
         
          className="w-full bg-red-600/70 text-white hover:bg-red-600/80 rounded-xl"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
        </Button>
      </section>
    </main>
  );
}
