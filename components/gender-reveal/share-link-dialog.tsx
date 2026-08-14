"use client";

import { useEffect, useRef, useState } from "react";

export type ShareLinkDialogProps = {
  shareLink: string;
  onClose: () => void;
};

export default function ShareLinkDialog({
  shareLink,
  onClose,
}: ShareLinkDialogProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastKind, setToastKind] = useState<"status" | "alert">("status");
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const focusable = () =>
    Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled])'
      ) ?? []
    );
  const restoreFocus = () => previousActiveElement.current?.focus();
  const closeDialog = () => {
    restoreFocus();
    onClose();
  };

  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    const closeButton = dialogRef.current?.querySelector<HTMLButtonElement>(
      'button[aria-label="닫기"]'
    );
    closeButton?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeDialog();
        return;
      }
      if (e.key === "Tab") {
        const elements = focusable();
        if (!elements.length) return;
        e.preventDefault();
        const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
        const nextIndex = e.shiftKey
          ? (currentIndex - 1 + elements.length) % elements.length
          : (currentIndex + 1) % elements.length;
        elements[nextIndex].focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previousActiveElement.current?.focus();
    };
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
      setToastKind("status");
      setToastMessage("복사가 완료 되었습니다.");
    } catch {
      setToastKind("alert");
      setToastMessage("복사에 실패했어요. 링크를 직접 선택해 복사해주세요");
    }
  };

  return (
    <div
      data-testid="dialog-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeDialog}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="풍선이 완성되었어요"
        className="relative flex w-[min(350px,100%)] flex-col items-center rounded-[10px] bg-white px-5 pb-5 pt-[49px] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={closeDialog}
          className="absolute top-[29px] right-5 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"
        >
          <span aria-hidden="true">×</span>
        </button>

        <h2 className="text-xl font-bold text-[#232323]">
          풍선이 완성되었어요!
        </h2>
        <p className="mt-[30px] flex flex-col text-center text-sm text-[#9f9f9f]">
          <span>링크를 복사하여 카카오톡이나</span>
          <span>문자로 공유해보세요.</span>
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
            className="h-[61px] w-full rounded-xl bg-[#232323] text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99]"
          >
            공유 링크 복사
          </button>
        </div>

        {toastMessage && (
          <div
            role={toastKind}
            className="fixed top-5 rounded-lg bg-[#232323] px-4 py-2 text-center text-xs text-white shadow-md"
          >
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
