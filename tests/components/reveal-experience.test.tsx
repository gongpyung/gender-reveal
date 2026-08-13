import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RevealExperience from "@/components/gender-reveal/reveal-experience";
import MissingReveal from "@/components/gender-reveal/missing-reveal";
import { RevealRecord } from "@/lib/reveals/types";

const sampleReveal: RevealRecord = {
  token: "test-token-123",
  babyNickname: "깡총이",
  dueDate: "2026-12-25",
  recipientName: "할머니, 할아버지",
  babyGender: "daughter",
  createdAt: new Date(),
};

describe("RevealExperience and MissingReveal", () => {
  it("renders recipient question and initial 0 / 10 progress", () => {
    render(<RevealExperience reveal={sampleReveal} />);

    expect(screen.getByText(/깡총이는/)).toBeInTheDocument();
    expect(screen.getByText(/아들일까요\? 딸일까요\?/)).toBeInTheDocument();
    expect(screen.getByText("0 / 10")).toBeInTheDocument();
  });

  it("renders missing reveal screen with reference message", () => {
    render(<MissingReveal />);

    expect(
      screen.getByText("존재하지 않는 젠더리빌 링크입니다")
    ).toBeInTheDocument();
  });
});
