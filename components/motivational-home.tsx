"use client";

import { useEffect, useState } from "react";

const MOTIVATIONAL_PHRASES = [
  "Buen día 💪 ¿Entrenamos?",
  "Activa el día con un buen WOD ⚡",
  "Un entrenamiento y cambia todo 💪",
  "Reinicia el día entrenando ⚡",
  "Cierra el día entrenando 🔥",
  "Tu mejor hora empieza ahora 🏋️",
  "Entrena y cambia el ritmo 🔥",
  "    Hora de desconectarse entrenando 💥"
];

export function MotivationalHome() {
  const [phrase, setPhrase] = useState("Buen día 💪 ¿Entrenamos?");

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
    setPhrase(MOTIVATIONAL_PHRASES[randomIndex]);
  }, []);

  return (
    <p className="text-white text-2xl sm:text-3xl font font-semibold text-balance max-w-80 md:max-w-md mb-6 transition-opacity duration-500 ">
      {phrase}
    </p>
  );
}
