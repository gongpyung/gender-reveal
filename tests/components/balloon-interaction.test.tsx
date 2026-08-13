import { render, screen, act, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useState } from "react";
import BalloonInteraction from "@/components/gender-reveal/balloon-interaction";
import { RevealRecord } from "@/lib/reveals/types";

const sampleReveal: RevealRecord = {
  token: "test-token-123",
  babyNickname: "깡총이",
  dueDate: "2026-12-25",
  recipientName: "할머니, 할아버지",
  babyGender: "daughter",
  createdAt: new Date(),
};

function TestWrapper({
  onTouchSpy,
  onCompleteSpy,
}: {
  onTouchSpy: () => void;
  onCompleteSpy: () => void;
}) {
  const [touchCount, setTouchCount] = useState(0);
  const [isBursting, setIsBursting] = useState(false);

  const handleTouch = () => {
    onTouchSpy();
    setTouchCount((prev) => {
      const next = prev + 1;
      if (next === 10) {
        setIsBursting(true);
      }
      return next;
    });
  };

  return (
    <BalloonInteraction
      reveal={sampleReveal}
      touchCount={touchCount}
      isBursting={isBursting}
      onTouch={handleTouch}
      onComplete={onCompleteSpy}
    />
  );
}

describe("BalloonInteraction", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("handles tap increments and triggers onComplete after 600 ms burst", () => {
    const onTouchSpy = vi.fn();
    const onCompleteSpy = vi.fn();

    render(
      <TestWrapper
        onTouchSpy={onTouchSpy}
        onCompleteSpy={onCompleteSpy}
      />
    );

    const touchButton = screen.getByRole("button", { name: /풍선 터치하기/i });

    // Click 9 times
    for (let i = 0; i < 9; i++) {
      fireEvent.click(touchButton);
    }

    expect(screen.getByText("9 / 10")).toBeInTheDocument();
    expect(onTouchSpy).toHaveBeenCalledTimes(9);
    expect(onCompleteSpy).not.toHaveBeenCalled();

    // 10th click
    fireEvent.click(touchButton);

    expect(screen.getByText("10 / 10")).toBeInTheDocument();
    expect(touchButton).toBeDisabled();

    // Advance 599 ms
    act(() => {
      vi.advanceTimersByTime(599);
    });
    expect(onCompleteSpy).not.toHaveBeenCalled();

    // Advance 1 ms (total 600 ms)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onCompleteSpy).toHaveBeenCalledTimes(1);

    // Further clicks or timer advances do not trigger onComplete again
    fireEvent.click(touchButton);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onCompleteSpy).toHaveBeenCalledTimes(1);
  });
});
