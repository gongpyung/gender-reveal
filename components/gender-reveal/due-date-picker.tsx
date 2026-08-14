"use client";

import { forwardRef, useState } from "react";
import { DayPicker } from "@daypicker/react";
import { ko } from "@daypicker/react/locale";
import * as Popover from "@radix-ui/react-popover";
import { parseDateInput } from "@/lib/reveals/date";

export type DueDatePickerProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  describedBy?: string;
};

function formatDateValue(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDisplayValue(value: string) {
  const date = parseDateInput(value);
  if (!date) return "연.월.일";
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}`;
}

const currentYear = new Date().getFullYear();
const calendarStart = new Date(currentYear - 1, 0);
const calendarEnd = new Date(currentYear + 5, 11);

const DueDatePicker = forwardRef<HTMLButtonElement, DueDatePickerProps>(
  function DueDatePicker(
    { id, value, onChange, invalid = false, describedBy },
    ref
  ) {
    const [open, setOpen] = useState(false);
    const selected = parseDateInput(value) ?? undefined;

    return (
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            ref={ref}
            id={id}
            type="button"
            aria-label="출산 예정일"
            aria-invalid={invalid}
            aria-describedby={describedBy}
            aria-haspopup="dialog"
            className={`flex h-12 w-full items-center rounded-[4px] bg-[#f2f2f2] px-4 text-left text-sm outline-none transition ${
              value ? "text-[#232323]" : "text-[#9f9f9f]"
            } ${invalid ? "ring-2 ring-red-400" : ""}`}
          >
            {formatDisplayValue(value)}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            collisionPadding={16}
            className="z-50 w-[306px] max-w-[calc(100vw-2rem)] rounded-xl border border-[#cae7ff] bg-white p-3 text-[#232323] shadow-[0_12px_32px_rgba(35,35,35,0.18)]"
          >
            <DayPicker
              mode="single"
              locale={ko}
              captionLayout="dropdown"
              navLayout="after"
              startMonth={calendarStart}
              endMonth={calendarEnd}
              selected={selected}
              defaultMonth={selected}
              onSelect={(date) => {
                if (!date) return;
                onChange(formatDateValue(date));
                setOpen(false);
              }}
              className="due-date-calendar"
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    );
  }
);

export default DueDatePicker;
