import { render, screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import ShareLinkDialog from "@/components/gender-reveal/share-link-dialog";

describe("ShareLinkDialog", () => {
  const shareLink = "https://example.test/gender-reveal/test-token";
  const onClose = vi.fn();
  let writeTextMock: any;

  beforeEach(() => {
    vi.restoreAllMocks();
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });
  });

  it("copies link to clipboard and displays toast for 2400 ms", async () => {
    vi.useFakeTimers();
    render(<ShareLinkDialog shareLink={shareLink} onClose={onClose} />);

    const copyButton = screen.getByRole("button", { name: /링크 복사하기/i });
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(writeTextMock).toHaveBeenCalledWith(shareLink);
    expect(screen.getByText("복사가 완료 되었습니다.")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2400);
    });

    expect(screen.queryByText("복사가 완료 되었습니다.")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("handles clipboard failure", async () => {
    writeTextMock.mockRejectedValueOnce(new Error("Clipboard denied"));

    render(<ShareLinkDialog shareLink={shareLink} onClose={onClose} />);

    const copyButton = screen.getByRole("button", { name: /링크 복사하기/i });
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(
      screen.getByText(
        "복사에 실패했어요. 링크를 직접 선택해 복사해주세요"
      )
    ).toBeInTheDocument();
  });

  it("calls onClose when clicking close button, overlay, or pressing Escape", async () => {
    render(<ShareLinkDialog shareLink={shareLink} onClose={onClose} />);

    // Close button click
    const closeButton = screen.getByRole("button", { name: /닫기/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Overlay click
    const overlay = screen.getByTestId("dialog-overlay");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(2);

    // Dialog content click should NOT call onClose
    const dialogContent = screen.getByRole("dialog");
    fireEvent.click(dialogContent);
    expect(onClose).toHaveBeenCalledTimes(2);

    // Escape key
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
