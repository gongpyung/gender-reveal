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
    onClose.mockClear();
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

    expect(screen.getByText("링크를 복사하여 카카오톡이나")).toBeInTheDocument();
    expect(screen.getByText("문자로 공유해보세요.")).toBeInTheDocument();
    const copyButton = screen.getByRole("button", { name: "공유 링크 복사" });
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(writeTextMock).toHaveBeenCalledWith(shareLink);
    expect(screen.getByRole("status")).toHaveTextContent("복사가 완료 되었습니다.");

    act(() => {
      vi.advanceTimersByTime(2400);
    });

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("handles clipboard failure", async () => {
    writeTextMock.mockRejectedValueOnce(new Error("Clipboard denied"));

    render(<ShareLinkDialog shareLink={shareLink} onClose={onClose} />);

    const copyButton = screen.getByRole("button", { name: "공유 링크 복사" });
    await act(async () => {
      fireEvent.click(copyButton);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "복사에 실패했어요. 링크를 직접 선택해 복사해주세요"
    );
  });

  it("moves focus into the dialog, traps Tab, and restores focus on close", async () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    render(<ShareLinkDialog shareLink={shareLink} onClose={onClose} />);

    const closeButton = screen.getByRole("button", { name: "닫기" });
    expect(closeButton).toHaveFocus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(screen.getByDisplayValue(shareLink)).toHaveFocus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(screen.getByRole("button", { name: "공유 링크 복사" })).toHaveFocus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(closeButton).toHaveFocus();

    fireEvent.click(closeButton);
    expect(trigger).toHaveFocus();
    trigger.remove();
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
