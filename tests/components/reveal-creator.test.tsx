import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import CreatorPage from "@/app/gender-reveal/page";

describe("CreatorPage / RevealCreator", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the reference creator heading and form fields", () => {
    render(<CreatorPage />);
    expect(screen.getByText("Gender-Reveal")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Come on baby" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/아기 별명/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/출산 예정일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/받는 사람/i)).toBeInTheDocument();
  });

  it("shows form-level validation error when submitting empty form", async () => {
    const user = userEvent.setup();
    render(<CreatorPage />);

    const submitButton = screen.getByRole("button", {
      name: /젠더리빌 풍선 만들기/i,
    });
    await user.click(submitButton);

    expect(screen.getByText("정보를 모두 입력해주세요")).toBeInTheDocument();
  });

  it("submits valid form data and shows share link dialog", async () => {
    const user = userEvent.setup();
    const fakeShareLink = "https://example.test/gender-reveal/abc123token";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ shareLink: fakeShareLink }),
    } as Response);

    render(<CreatorPage />);

    await user.type(screen.getByLabelText(/아기 별명/i), "깡총이");
    await user.type(screen.getByLabelText(/출산 예정일/i), "2026-12-25");
    await user.type(screen.getByLabelText(/받는 사람/i), "할머니, 할아버지");
    await user.click(screen.getByLabelText(/딸/i));

    const submitButton = screen.getByRole("button", {
      name: /젠더리빌 풍선 만들기/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("풍선이 완성되었어요!")).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue(fakeShareLink)).toBeInTheDocument();
  });

  it("handles fetch failure gracefully while retaining inputs", async () => {
    const user = userEvent.setup();

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ code: "CREATE_FAILED" }),
    } as Response);

    render(<CreatorPage />);

    await user.type(screen.getByLabelText(/아기 별명/i), "깡총이");
    await user.type(screen.getByLabelText(/출산 예정일/i), "2026-12-25");
    await user.type(screen.getByLabelText(/받는 사람/i), "할머니, 할아버지");
    await user.click(screen.getByLabelText(/딸/i));

    const submitButton = screen.getByRole("button", {
      name: /젠더리빌 풍선 만들기/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText("링크 생성에 실패했어요. 다시 시도해주세요")
      ).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/아기 별명/i)).toHaveValue("깡총이");
  });
});
