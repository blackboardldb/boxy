"use client";

import { useEffect, useState } from "react";
import type { FitCenterUserProfile } from "@/lib/types";

interface BirthdayGreetingProps {
  userProfile: FitCenterUserProfile;
}

export function BirthdayGreeting({ userProfile }: BirthdayGreetingProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isBirthday, setIsBirthday] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!userProfile.dateOfBirth) return;

    // dateOfBirth is "YYYY-MM-DD"
    const parts = userProfile.dateOfBirth.split("-");
    if (parts.length !== 3) return;

    const birthMonth = parseInt(parts[1], 10);
    const birthDay = parseInt(parts[2], 10);

    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() is 0-indexed
    const currentDate = today.getDate();

    if (birthMonth === currentMonth && birthDay === currentDate) {
      setIsBirthday(true);

      // check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!prefersReducedMotion) {
        // dynamic import of canvas-confetti
        import("canvas-confetti").then((module) => {
          const confetti = module.default;
          const duration = 3000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

          function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
          }

          const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
          }, 250);
        });
      }
    }
  }, [userProfile.dateOfBirth]);

  if (!isMounted || !isBirthday) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-lime-500/20 via-emerald-500/10 to-transparent border border-lime-500/30 rounded-2xl p-5 mb-6 animate-in fade-in slide-in-from-top duration-500">
      {/* Glow effect */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-lime-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center gap-4 relative z-10">
        <span className="text-3xl animate-bounce" role="img" aria-label="cake">🎂</span>
        <div>
          <h3 className="text-lg font-bold text-white">
            ¡Feliz cumpleaños, {userProfile.firstName}! 🎉
          </h3>
          <p className="text-zinc-300 text-sm mt-1">
            De parte de todo el equipo de BS, ¡te deseamos un día espectacular y lleno de energía! 💪✨
          </p>
        </div>
      </div>
    </div>
  );
}
