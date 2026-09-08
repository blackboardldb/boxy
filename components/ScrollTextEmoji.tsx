"use client";

import React, { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ScrollTextEmoji: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  // Contenido adaptado a Boxy: corto, potente y enfocado en flexibilidad y funciones justas.
  const content = [
    { type: 'text', value: 'Tu' },
    { type: 'text', value: 'centro,' },
    { type: 'emoji', value: '🏟️' },
    { type: 'text', value: 'tus' },
    { type: 'text', value: 'reglas.' },
    { type: 'text', value: 'Un' },
    { type: 'text', value: 'software' },
    { type: 'emoji', value: '💻' },
    { type: 'text', value: 'más' },
    { type: 'text', value: 'flexible,' },
    { type: 'text', value: 'con' },
    { type: 'text', value: 'lo' },
    { type: 'text', value: 'justo' },
    { type: 'text', value: 'y' },
    { type: 'text', value: 'necesario.' },
    { type: 'emoji', value: '🎯' },
    { type: 'text', value: 'Cero' },
    { type: 'text', value: 'complejidad,' },
    { type: 'text', value: '100%' },
    { type: 'text', value: 'potencia.' },
    { type: 'emoji', value: '⚡' },
    { type: 'text', value: 'Diseñado' },
    { type: 'text', "value": 'para' },
    { type: 'text', value: 'ti,' },
    { type: 'text', value: 'y' },
    { type: 'text', value: 'punto.' },
    { type: 'emoji', value: '🔥' }
  ];

  useGSAP(() => {
    // Revelado fluido de cada elemento (palabra o emoji)
    gsap.fromTo(".reveal-item",
      { opacity: 0.1 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: true,
        }
      }
    );

    // Animación extra para los emojis cuando se revelan
    gsap.fromTo(".reveal-emoji",
      { scale: 0.5, rotate: -10 },
      {
        scale: 1,
        rotate: 0,
        stagger: 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: container.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: true,
        }
      }
    );
  }, { scope: container });

  return (
    <div ref={container} className="relative py-32 md:py-60 px-6 md:px-20 bg-black text-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <p className="text-6xl lg:text-8xl font-black leading-[1.15] tracking-tighter text-left uppercase">
          {content.map((item, index) => (
            item.type === 'text' ? (
              <span key={index} className="reveal-item inline-block mr-[0.2em] mb-2">
                {item.value}
              </span>
            ) : (
              <span key={index} className="reveal-item reveal-emoji inline-flex items-center justify-center bg-zinc-900 border border-zinc-800 text-yellow-400 w-[1.1em] h-[1.1em] rounded-full mx-[0.1em] mb-2 align-middle shadow-lg">
                <span className="text-[0.55em]">{item.value}</span>
              </span>
            )
          ))}
        </p>
      </div>
    </div>
  );
};

export default ScrollTextEmoji;
