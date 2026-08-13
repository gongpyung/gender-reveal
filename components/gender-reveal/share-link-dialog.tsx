"use client";

import { useEffect, useState } from "react";

export type ShareLinkDialogProps = {
  shareLink: string;
  onClose: () => void;
};

export default function ShareLinkDialog({
  shareLink,
  onClose,
}: ShareLinkDialogProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setToastMessage("복사가 완료 되었습니다.");
    } catch {
      setToastMessage("복사에 실패했어요. 링크를 직접 선택해 복사해주세요");
    }
  };

  return (
    <div
      data-testid="dialog-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="풍선이 완성되었어요"
        className="relative flex w-[min(350px,100%)] flex-col items-center rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
        >
          {/* SVG close icon or fallback */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/step1/close-icon.svg"
            alt="닫기"
            className="h-4 w-4"
            onError={(e) => {
              // Fallback text if asset not downloaded yet
              e.currentTarget.style.display = "none";
              const parent = e.currentTarget.parentElement;
              if (parent && !parent.textContent) parent.textContent = "✕";
            }}
          />
        </button>

        <h2 className="mt-2 text-xl font-bold text-[#232323]">
          풍선이 완성되었어요!
        </h2>
        <p className="mt-1 text-center text-sm text-[#9f9f9f]">
          아래 링크를 복사하여 전달해주시면
          <br />
          풍선을 10번 눌러 확인할 수 있어요.
        </p>

        <div className="mt-4 flex w-full flex-col gap-3">
          <input
            type="text"
            readOnly
            value={shareLink}
            className="w-full rounded-xl bg-[#f2f2f2] px-4 py-3 text-center text-xs text-[#232323] outline-none"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />

          <button
            type="button"
            onClick={handleCopy}
            className="w-full rounded-xl bg-[#232323] py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99]"
          >
            링크 복사하기 ›
          </button>
        </div>

        {toastMessage && (
          <div className="mt-3 rounded-lg bg-[#232323]/90 px-4 py-2 text-center text-xs text-white shadow-md">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
