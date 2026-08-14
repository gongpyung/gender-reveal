import html2canvas from "html2canvas";
import { Gender } from "./types";

export type PreparedResult = {
  dataUrl: string;
  file: File;
};

export async function captureResult(
  element: HTMLElement,
  gender: Gender
): Promise<PreparedResult> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Capture timed out")), 12000);
  });

  const capturePromise = (async () => {
    // Ensure all images are loaded
    const images = Array.from(element.querySelectorAll("img"));
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        if (img.complete && img.naturalWidth === 0) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      imageTimeout: 8000,
    });

    const dataUrl = canvas.toDataURL("image/png");
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const fileName = `gender-reveal-${gender}.png`;
    const file = new File([blob], fileName, { type: "image/png" });

    return { dataUrl, file };
  })();

  try {
    return await Promise.race([capturePromise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

export async function shareOrDownloadResult(
  prepared: PreparedResult
): Promise<void> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("Share timed out")), 15000);
  });

  const actionPromise = (async () => {
    if (
      typeof navigator !== "undefined" &&
      navigator.canShare &&
      navigator.canShare({ files: [prepared.file] })
    ) {
      try {
        await navigator.share({
          title: "젠더리빌 결과",
          text: "아기의 성별을 확인해보세요!",
          files: [prepared.file],
        });
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return;
        }
        throw err;
      }
    }

    // Fallback download
    const link = document.createElement("a");
    link.href = prepared.dataUrl;
    link.download = prepared.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  })();

  try {
    await Promise.race([actionPromise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}
