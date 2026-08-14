import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import RevealResult from "@/components/gender-reveal/reveal-result";
import { RevealRecord } from "@/lib/reveals/types";
import * as imageShare from "@/lib/reveals/image-share";

vi.mock("@/lib/reveals/image-share", async () => {
  const actual = await vi.importActual<typeof import("@/lib/reveals/image-share")>(
    "@/lib/reveals/image-share"
  );
  return {
    ...actual,
    captureResult: vi.fn(),
    shareOrDownloadResult: vi.fn(),
  };
});

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
    vi.mocked(imageShare.captureResult).mockResolvedValue({
      dataUrl: "data:image/png;base64,encoded",
      file: new File(["png"], "gender-reveal-son.png", { type: "image/png" }),
    });
    vi.mocked(imageShare.shareOrDownloadResult).mockResolvedValue(undefined);
  });

  it("renders the son result content and artwork", () => {
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

  it("renders the daughter result content and artwork", () => {
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

  it("uses accessible artwork and a two-action result row", () => {
    render(
      <RevealResult
        reveal={sonReveal}
        onReplay={onReplay}
        onCreateNew={onCreateNew}
      />
    );

    expect(screen.getByRole("presentation")).toHaveAttribute(
      "src",
      "/img/step3/bubble-son.png"
    );
    expect(screen.getByAltText("아들").className).toContain("h-[168px]");
    const actions = screen.getByRole("button", { name: "결과 저장하기" }).parentElement;
    expect(actions).toHaveClass("flex-row");
    expect(screen.getByRole("button", { name: "‹ 뒤로가기" })).toBeInTheDocument();
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

  it("shows preparation failure and allows retrying the capture", async () => {
    vi.mocked(imageShare.captureResult)
      .mockRejectedValueOnce(new Error("capture failed"))
      .mockResolvedValueOnce({
        dataUrl: "data:image/png;base64,encoded",
        file: new File(["png"], "gender-reveal-son.png", { type: "image/png" }),
      });

    render(
      <RevealResult
        reveal={sonReveal}
        onReplay={onReplay}
        onCreateNew={onCreateNew}
      />
    );

    await waitFor(() =>
      expect(
        screen.getByText("이미지를 준비하지 못했어요. 다시 시도해주세요")
      ).toBeInTheDocument()
    );
    const saveButton = screen.getByRole("button", { name: "결과 저장하기" });
    expect(saveButton).toBeEnabled();

    fireEvent.click(saveButton);
    await waitFor(() => expect(imageShare.captureResult).toHaveBeenCalledTimes(2));
  });

  it("shows a save failure while keeping the result visible", async () => {
    vi.mocked(imageShare.shareOrDownloadResult).mockRejectedValueOnce(
      new Error("save failed")
    );

    render(
      <RevealResult
        reveal={sonReveal}
        onReplay={onReplay}
        onCreateNew={onCreateNew}
      />
    );

    await waitFor(() => expect(imageShare.captureResult).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "결과 저장하기" }));

    await waitFor(() =>
      expect(
        screen.getByText("이미지 저장에 실패했어요. 다시 시도해주세요")
      ).toBeInTheDocument()
    );
    expect(screen.getByText("'아들'이에요!")).toBeInTheDocument();
  });
});
