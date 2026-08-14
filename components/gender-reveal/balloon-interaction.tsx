"use client";

import { useEffect, useRef, useState } from "react";
import { RevealRecord } from "@/lib/reveals/types";
import BalloonParticles from "./balloon-particles";

export type BalloonInteractionProps = {
  reveal: RevealRecord;
  touchCount: number;
  isBursting: boolean;
  onTouch: () => void;
  onComplete: () => void;
};

const hearts = [
  ["pink", "left-[-30%] top-[9%]", "w-[23%]", "0s"],
  ["blue", "left-[-52%] top-[39%]", "w-[23%]", "0.3s"],
  ["pink", "left-[-34%] top-[75%]", "w-[23%]", "0.6s"],
  ["blue", "left-[114%] top-[27%]", "w-[23%]", "0.15s"],
  ["pink", "left-[126%] top-[67%]", "w-[23%]", "0.45s"],
  ["pink", "left-[93%] top-[100%]", "w-[15%]", "0.75s"],
] as const;

export default function BalloonInteraction({
  reveal,
  touchCount,
  isBursting,
  onTouch,
  onComplete,
}: BalloonInteractionProps) {
  const [tapFeedbacks, setTapFeedbacks] = useState<number[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const previousCount = useRef(touchCount);

  useEffect(() => {
    if (touchCount > previousCount.current && touchCount < 10) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), 400);
      return () => clearTimeout(timer);
    }
    previousCount.current = touchCount;
  }, [touchCount]);

  useEffect(() => {
    if (!isBursting) return;
    const timer = setTimeout(onComplete, 600);
    return () => clearTimeout(timer);
  }, [isBursting, onComplete]);

  const handleTap = () => {
    if (isBursting || touchCount >= 10) return;
    setTapFeedbacks((prev) => [...prev, Date.now()]);
    setTimeout(() => setTapFeedbacks((prev) => prev.slice(1)), 600);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(15);
    onTouch();
  };

  const scale = 1 + 0.04 * Math.min(touchCount, 9);

  return (
    <div className="flex w-full flex-col items-center">
      <h1 className="font-pixel text-center text-2xl leading-tight text-[#232323]">
        {reveal.babyNickname}는<br />아들일까요? 딸일까요?
      </h1>
      <p className="mt-2 text-center text-xs text-[#9f9f9f]">
        풍선을 10번 눌러 아기의 성별을 확인해보세요!
      </p>
      <div className="relative my-8 flex h-[280px] w-full max-w-[320px] items-center justify-center select-none">
        {hearts.map(([color, position, width, delay], index) => (
          <img
            key={`${color}-${index}`}
            src={`/img/step2/heart-${color}.png`}
            alt=""
            aria-hidden="true"
            className={`absolute ${position} ${width} animate-heart-float`}
            style={{ animationDelay: delay }}
          />
        ))}
        <BalloonParticles visible={isBursting} />
        {tapFeedbacks.map((id) => (
          <span key={id} className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-sm font-extrabold text-[#ff9999] animate-tap-pop">
            Tab!
          </span>
        ))}
        <button
          type="button"
          aria-label={`풍선 터치하기 (${touchCount}/10)`}
          disabled={isBursting || touchCount >= 10}
          onClick={handleTap}
          className={`relative z-10 h-[220px] w-[220px] rounded-full transition-transform duration-150 disabled:pointer-events-none ${isShaking ? "animate-balloon-shake" : "animate-float"} ${isBursting ? "animate-burst opacity-0" : ""}`}
          style={{ "--balloon-scale": scale } as React.CSSProperties}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/step2/balloon.png" alt="젠더리빌 풍선" className="h-full w-full object-contain" />
        </button>
      </div>
      <p className="mt-3 text-sm font-bold text-[#9f9f9f]">{touchCount} / 10</p>
    </div>
  );
}
