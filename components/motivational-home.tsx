"use client";

import { useEffect, useState } from "react";

const MOTIVATIONAL_PHRASES = [
  "Buen día 💪 ¿Entrenamos?",
  "Activa el día con un buen WOD ⚡",
  "Un entrenamiento y cambia todo 💪",
  "¿Escapamos a entrenar? 😎",
  "Reinicia el día entrenando ⚡",
  "Todavía estás a tiempo 💪",
  "Cierra el día entrenando 🔥",
  "Tu mejor hora empieza ahora 🏋️",
  "Entrena y cambia el ritmo 🔥",
];

export function MotivationalHome() {
  const [phrase, setPhrase] = useState("Buen día 💪 ¿Entrenamos?");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
    setPhrase(MOTIVATIONAL_PHRASES[randomIndex]);
  }, []);

  return (
    <p className="text-white text-3xl sm:text-4xl font font-semibold text-wrap max-w-80 md:max-w-md mb-6 sm:mb-12 transition-opacity duration-500 text-pretty">
      {phrase}
    </p>
  );
}
