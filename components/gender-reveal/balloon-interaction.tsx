"use client";

import { useEffect, useState } from "react";
import { RevealRecord } from "@/lib/reveals/types";

export type BalloonInteractionProps = {
  reveal: RevealRecord;
  touchCount: number;
  isBursting: boolean;
  onTouch: () => void;
  onComplete: () => void;
};

type TapFeedback = {
  id: number;
  x: number;
  y: number;
};

export default function BalloonInteraction({
  reveal,
  touchCount,
  isBursting,
  onTouch,
  onComplete,
}: BalloonInteractionProps) {
  const [tapFeedbacks, setTapFeedbacks] = useState<TapFeedback[]>([]);

  useEffect(() => {
    if (!isBursting) return;
    const timer = setTimeout(() => {
      onComplete();
    }, 600);
    return () => clearTimeout(timer);
  }, [isBursting, onComplete]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (isBursting || touchCount >= 10) return;

    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {}
    }

    const rect = e.currentTarget.getBoundingClientRect();
    let clientX = rect.left + rect.width / 2;
    let clientY = rect.top + rect.height / 2;

    if ("touches" in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ("clientX" in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const id = Date.now() + Math.random();
    const x = clientX - rect.left + (Math.random() * 40 - 20);
    const y = clientY - rect.top + (Math.random() * 40 - 20);

    setTapFeedbacks((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setTapFeedbacks((prev) => prev.filter((item) => item.id !== id));
    }, 600);

    onTouch();
  };

  const scale = 1 + 0.04 * Math.min(touchCount, 9);

  return (
    <div className="flex w-full flex-col items-center">
      <h1 className="text-center text-2xl font-bold leading-tight text-[#232323]">
        {reveal.babyNickname}는<br />
        아들일까요? 딸일까요?
      </h1>

      <p className="mt-2 text-center text-xs text-[#9f9f9f]">
        풍선을 10번 눌러 아기의 성별을 확인해보세요!
      </p>

      {/* Floating hearts container & balloon */}
      <div
        className="relative my-8 flex h-[280px] w-full max-w-[320px] items-center justify-center cursor-pointer select-none"
        onClick={handleTap}
      >
        {/* Floating background hearts */}
        <div className="pointer-events-none absolute inset-0">
          <span className="absolute left-[10%] top-[15%] text-pink-300 animate-pulse text-xl">♥</span>
          <span className="absolute right-[12%] top-[20%] text-blue-300 animate-pulse text-lg">♥</span>
          <span className="absolute left-[15%] bottom-[20%] text-blue-300 animate-pulse text-base">♥</span>
          <span className="absolute right-[15%] bottom-[15%] text-pink-300 animate-pulse text-xl">♥</span>
        </div>

        {/* Balloon image container */}
        <div
          className={`relative transition-transform duration-150 ${
            isBursting ? "animate-ping opacity-0 duration-500" : ""
          }`}
          style={{ transform: `scale(${scale})` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/step2/balloon.png"
            alt="젠더리빌 풍선"
            className="h-[200px] w-[200px] object-contain"
            onError={(e) => {
              // Visual fallback box if asset is missing before download
              const target = e.currentTarget;
              target.style.display = "none";
              if (target.parentElement) {
                target.parentElement.classList.add(
                  "h-[200px]",
                  "w-[200px]",
                  "rounded-full",
                  "bg-pink-100",
                  "flex",
                  "items-center",
                  "justify-center"
                );
              }
            }}
          />
        </div>

        {/* Tap! feedback popups */}
        {tapFeedbacks.map((fb) => (
          <span
            key={fb.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-sm font-extrabold text-[#ff9999] transition-all animate-bounce"
            style={{ left: fb.x, top: fb.y }}
          >
            Tap!
          </span>
        ))}
      </div>

      {/* Touch Button and Progress */}
      <button
        type="button"
        disabled={isBursting || touchCount >= 10}
        onClick={handleTap}
        className="h-[60px] w-[min(380px,100%)] rounded-2xl bg-[#232323] text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
      >
        풍선 터치하기 ({touchCount}/10)
      </button>

      <p className="mt-3 text-sm font-bold text-[#9f9f9f]">{touchCount} / 10</p>
    </div>
  );
}
