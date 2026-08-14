"use client";

import { useEffect, useRef, useState } from "react";
import { RevealRecord } from "@/lib/reveals/types";
import { formatDueDate } from "@/lib/reveals/date";
import {
  PreparedResult,
  captureResult,
  shareOrDownloadResult,
} from "@/lib/reveals/image-share";

export type RevealResultProps = {
  reveal: RevealRecord;
  onReplay: () => void;
  onCreateNew: () => void;
};

export default function RevealResult({
  reveal,
  onReplay,
  onCreateNew,
}: RevealResultProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [prepared, setPrepared] = useState<PreparedResult | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSon = reveal.babyGender === "son";
  const formattedDate = formatDueDate(reveal.dueDate);

  useEffect(() => {
    let isMounted = true;
    const prepare = async () => {
      if (!cardRef.current) return;
      setIsCapturing(true);
      try {
        const result = await captureResult(cardRef.current, reveal.babyGender);
        if (isMounted) {
          setPrepared(result);
          setErrorMessage(null);
        }
      } catch {
        if (isMounted) {
          setErrorMessage("이미지를 준비하지 못했어요. 다시 시도해주세요");
        }
      } finally {
        if (isMounted) {
          setIsCapturing(false);
        }
      }
    };

    // Give DOM time to render images
    const timer = setTimeout(prepare, 300);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [reveal]);

  const handleShareOrSave = async () => {
    setErrorMessage(null);
    setIsSharing(true);
    try {
      let targetPrepared = prepared;
    if (!targetPrepared && cardRef.current) {
        try {
          targetPrepared = await captureResult(
            cardRef.current,
            reveal.babyGender
          );
          setPrepared(targetPrepared);
        } catch {
          setErrorMessage("이미지를 준비하지 못했어요. 다시 시도해주세요");
          return;
        }
      }

      if (targetPrepared) {
        await shareOrDownloadResult(targetPrepared);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setErrorMessage("이미지 저장에 실패했어요. 다시 시도해주세요");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const genderLabel = isSon ? "'아들'이에요!" : "'딸'이에요!";
  const genderColor = isSon ? "text-[#509fdf]" : "text-[#ff9999]";
  const babyImgSrc = isSon
    ? "/img/step3/baby-son.png"
    : "/img/step3/baby-daughter.png";
  const bubbleImgSrc = isSon
    ? "/img/step3/bubble-son.png"
    : "/img/step3/bubble-daughter.png";

  return (
    <div className="flex w-full flex-col items-center">
      {/* Result Card to capture */}
      <div
        ref={cardRef}
        className="flex w-[min(420px,100%)] flex-col items-center bg-white p-6"
      >
        <p className="text-center text-lg font-bold text-[#232323]">
          {reveal.babyNickname}는
        </p>
        <p className="text-center text-sm font-semibold text-[#9f9f9f]">
          귀엽고 사랑스러운
        </p>
        <h1 className={`mt-1 text-center text-3xl font-extrabold ${genderColor}`}>
          {genderLabel}
        </h1>

        {/* Baby image area */}
        <div className="relative my-6 flex h-[200px] w-full items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bubbleImgSrc}
            alt=""
            className="absolute h-[70px] w-[70px] -top-2 object-contain"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={babyImgSrc}
            alt={isSon ? "아들" : "딸"}
            className={`w-auto object-contain ${isSon ? "h-[168px]" : "h-[200px]"}`}
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
            }}
          />
        </div>

        {/* Closing info */}
        <div className="flex flex-col items-center gap-1 text-center text-xs text-[#232323]">
          <p className="font-bold">{reveal.recipientName}!</p>
          <p className="font-medium">{formattedDate}에</p>
          <p className="font-bold">건강하게 만나요 :)</p>
        </div>
      </div>

      {/* Action buttons outside card */}
      <div className="mt-6 flex w-[min(420px,100%)] flex-row items-center gap-[10px]">
        {errorMessage && (
          <p className="absolute mt-[90px] text-xs text-red-500" role="alert">
            {errorMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleShareOrSave}
          disabled={isCapturing || isSharing}
          className="h-[60px] min-w-0 flex-1 rounded-2xl bg-[#232323] text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
        >
          {isCapturing
            ? "이미지 준비 중..."
            : isSharing
            ? "저장 중..."
            : "결과 저장하기"}
        </button>

        <button
          type="button"
          onClick={onReplay}
          className="h-[60px] min-w-0 flex-1 rounded-2xl border border-[#232323] bg-white text-sm font-semibold text-[#232323]"
        >
          ‹ 뒤로가기
        </button>

        <button
          type="button"
          onClick={onCreateNew}
          className="absolute mt-[150px] text-xs font-semibold text-[#9f9f9f] underline hover:text-[#232323]"
        >
          젠더리빌 새로 만들기
        </button>
      </div>
    </div>
  );
}
