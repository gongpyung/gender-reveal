import { createRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DueDatePicker from "@/components/gender-reveal/due-date-picker";

function todayParts() {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
    day: today.getDate(),
  };
}

describe("DueDatePicker", () => {
  it("renders an accessible 48px trigger without a native date input", () => {
    render(
      <DueDatePicker
        id="dueDate"
        value=""
        onChange={vi.fn()}
        invalid
        describedBy="form-error"
      />
    );

    const trigger = screen.getByRole("button", { name: "출산 예정일" });
    expect(trigger).toHaveTextContent("연.월.일");
    expect(trigger).toHaveClass("h-12", "bg-[#f2f2f2]");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect(trigger).toHaveAttribute("aria-describedby", "form-error");
    expect(document.querySelector('input[type="date"]')).not.toBeInTheDocument();
  });

  it("formats a selected local calendar date and restores focus after closing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(
      <DueDatePicker id="dueDate" value="" onChange={onChange} ref={ref} />
    );

    const trigger = screen.getByRole("button", { name: "출산 예정일" });
    await user.click(trigger);
    const { year, month, day } = todayParts();
    const dayButton = screen.getByRole("button", {
      name: new RegExp(`${year}년 ${month}월 ${day}일`),
    });
    await user.click(dayButton);

    expect(onChange).toHaveBeenCalledWith(
      `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    );
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(ref.current).toHaveFocus();
  });

  it("closes on Escape and outside click", async () => {
    const user = userEvent.setup();
    render(<DueDatePicker id="dueDate" value="" onChange={vi.fn()} />);
    const trigger = screen.getByRole("button", { name: "출산 예정일" });

    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the exact display format for an existing value", () => {
    render(
      <DueDatePicker
        id="dueDate"
        value="2026-12-25"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "출산 예정일" })).toHaveTextContent(
      "2026. 12. 25"
    );
  });
});
