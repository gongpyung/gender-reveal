import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import RevealResult from "@/components/gender-reveal/reveal-result";
import { RevealRecord } from "@/lib/reveals/types";

const sonReveal: RevealRecord = {
  token: "son-token-123",
  babyNickname: "깡총이",
  dueDate: "2026-12-25",
  recipientName: "할머니, 할아버지",
  babyGender: "son",
  createdAt: new Date(),
};

const daughterReveal: RevealRecord = {
  token: "daughter-token-123",
  babyNickname: "깡총이",
  dueDate: "2026-12-25",
  recipientName: "할머니, 할아버지",
  babyGender: "daughter",
  createdAt: new Date(),
};

describe("RevealResult", () => {
  const onReplay = vi.fn();
  const onCreateNew = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders son reveal content with reference copy and artwork", () => {
    render(
      <RevealResult
        reveal={sonReveal}
        onReplay={onReplay}
        onCreateNew={onCreateNew}
      />
    );

    expect(screen.getByText("깡총이는")).toBeInTheDocument();
    expect(screen.getByText("귀엽고 사랑스러운")).toBeInTheDocument();
    expect(screen.getByText("'아들'이에요!")).toBeInTheDocument();
    expect(screen.getByText("할머니, 할아버지!")).toBeInTheDocument();
    expect(screen.getByText("2026년 12월 25일에")).toBeInTheDocument();
    expect(screen.getByText("건강하게 만나요 :)")).toBeInTheDocument();

    const img = screen.getByAltText("아들");
    expect(img).toHaveAttribute("src", "/img/step3/baby-son.png");
  });

  it("renders daughter reveal content with reference copy and artwork", () => {
    render(
      <RevealResult
        reveal={daughterReveal}
        onReplay={onReplay}
        onCreateNew={onCreateNew}
      />
    );

    expect(screen.getByText("깡총이는")).toBeInTheDocument();
    expect(screen.getByText("귀엽고 사랑스러운")).toBeInTheDocument();
    expect(screen.getByText("'딸'이에요!")).toBeInTheDocument();

    const img = screen.getByAltText("딸");
    expect(img).toHaveAttribute("src", "/img/step3/baby-daughter.png");
  });

  it("calls onReplay when clicking replay button and onCreateNew when clicking new link", () => {
    render(
      <RevealResult
        reveal={sonReveal}
        onReplay={onReplay}
        onCreateNew={onCreateNew}
      />
    );

    const replayButton = screen.getByRole("button", { name: /뒤로가기/i });
    fireEvent.click(replayButton);
    expect(onReplay).toHaveBeenCalledTimes(1);

    const createNewButton = screen.getByRole("button", {
      name: /젠더리빌 새로 만들기/i,
    });
    fireEvent.click(createNewButton);
    expect(onCreateNew).toHaveBeenCalledTimes(1);
  });
});
