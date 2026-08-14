"use client";

import { useMemo } from "react";

export default function BalloonParticles({ visible }: { visible: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        id: `heart-${index}`,
        left: `${15 + ((index * 37) % 70)}%`,
        top: `${10 + ((index * 53) % 70)}%`,
        color: index % 2 ? "/img/step2/heart-blue.png" : "/img/step2/heart-pink.png",
      })),
    []
  );

  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {particles.map((particle) => (
        <img
          key={particle.id}
          src={particle.color}
          alt=""
          className="absolute w-7 animate-heart-burst"
          style={{ left: particle.left, top: particle.top }}
        />
      ))}
      {particles.map((particle, index) => (
        <span
          key={`confetti-${particle.id}`}
          className={`absolute h-2 w-2 animate-confetti-burst ${index % 2 ? "bg-[#509fdf]" : "bg-[#ff9999]"}`}
          style={{ left: particle.left, top: particle.top }}
        />
      ))}
    </div>
  );
}
