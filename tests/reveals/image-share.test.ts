import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  captureResult,
  shareOrDownloadResult,
} from "@/lib/reveals/image-share";

const html2canvas = vi.hoisted(() => vi.fn());

vi.mock("html2canvas", () => ({ default: html2canvas }));

describe("image sharing helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    html2canvas.mockResolvedValue({
      toDataURL: vi.fn(() => "data:image/png;base64,encoded"),
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        blob: vi.fn().mockResolvedValue(new Blob(["png"], { type: "image/png" })),
      })
    );
  });

  it("waits for a usable image and passes the approved capture options", async () => {
    const element = document.createElement("div");
    const readyImage = document.createElement("img");
    const failedImage = document.createElement("img");
    Object.defineProperty(readyImage, "complete", { value: false });
    Object.defineProperty(readyImage, "naturalWidth", { value: 120 });
    Object.defineProperty(failedImage, "complete", { value: true });
    Object.defineProperty(failedImage, "naturalWidth", { value: 0 });
    element.append(readyImage, failedImage);

    const resultPromise = captureResult(element, "son");
    readyImage.dispatchEvent(new Event("load"));
    failedImage.dispatchEvent(new Event("error"));
    const result = await resultPromise;

    expect(html2canvas).toHaveBeenCalledWith(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      allowTaint: false,
      imageTimeout: 8000,
    });
    expect(result.file.name).toBe("gender-reveal-son.png");
  });

  it("clears the capture timeout after a successful capture", async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const element = document.createElement("div");

    await captureResult(element, "daughter");

    expect(clearTimeoutSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("clears the share timeout after a successful download", async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const file = new File(["png"], "gender-reveal-son.png", { type: "image/png" });

    await shareOrDownloadResult({ dataUrl: "data:image/png;base64,encoded", file });

    expect(click).toHaveBeenCalled();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
