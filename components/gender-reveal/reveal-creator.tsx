"use client";

import { useRef, useState } from "react";
import { Gender } from "@/lib/reveals/types";
import { revealInputSchema } from "@/lib/reveals/validation";
import ShareLinkDialog from "./share-link-dialog";

export default function RevealCreator() {
  const [babyNickname, setBabyNickname] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [babyGender, setBabyGender] = useState<Gender | "">("");

  const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createdShareLink, setCreatedShareLink] = useState<string | null>(null);
  const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parseResult = revealInputSchema.safeParse({
      babyNickname,
      dueDate,
      recipientName,
      babyGender,
    });

    if (!parseResult.success) {
      const newInvalids: Record<string, boolean> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        if (path) newInvalids[path] = true;
      });
      setInvalidFields(newInvalids);
      setErrorMessage("정보를 모두 입력해주세요");
      const firstInvalidField = [
        "babyNickname",
        "dueDate",
        "recipientName",
        "babyGender",
      ].find((field) => newInvalids[field]);
      if (firstInvalidField) fieldRefs.current[firstInvalidField]?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/reveals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseResult.data),
      });

      if (!response.ok) {
        throw new Error("Failed to create reveal");
      }

      const data = await response.json();
      setCreatedShareLink(data.shareLink);
    } catch {
      setErrorMessage("링크 생성에 실패했어요. 다시 시도해주세요");
    } finally {
      setIsLoading(false);
    }
  };

  const clearInvalid = (field: string) => {
    if (invalidFields[field]) {
      setInvalidFields((prev) => ({ ...prev, [field]: false }));
    }
    if (errorMessage === "정보를 모두 입력해주세요") {
      setErrorMessage(null);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-white p-4 sm:p-6">
      <section className="flex w-[min(420px,100%)] flex-col items-center bg-white p-5">
        <p className="m-0 text-[22px] font-bold tracking-wide text-[#232323]">
          Gender-Reveal
        </p>
        <h1 className="m-0 text-3xl sm:text-4xl font-extrabold text-[#232323]">
          Come on baby
        </h1>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="mt-16 flex w-full flex-col gap-[30px]"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="babyNickname"
              className="text-xs font-semibold text-[#232323]"
            >
              아기 태명
            </label>
            <input
              id="babyNickname"
              type="text"
              placeholder="예시: 깡총이"
              value={babyNickname}
              ref={(element) => {
                fieldRefs.current.babyNickname = element;
              }}
              aria-invalid={Boolean(invalidFields.babyNickname)}
              aria-describedby={invalidFields.babyNickname ? "form-error" : undefined}
              onChange={(e) => {
                setBabyNickname(e.target.value);
                clearInvalid("babyNickname");
              }}
              className={`h-12 w-full rounded-[4px] bg-[#f2f2f2] px-4 text-sm text-[#232323] outline-none transition ${
                invalidFields.babyNickname ? "ring-2 ring-red-400" : ""
              }`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="dueDate"
              className="text-xs font-semibold text-[#232323]"
            >
              출산 예정일
            </label>
            <div className="relative">
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                ref={(element) => {
                  fieldRefs.current.dueDate = element;
                }}
                aria-invalid={Boolean(invalidFields.dueDate)}
                aria-describedby={invalidFields.dueDate ? "form-error" : undefined}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  clearInvalid("dueDate");
                }}
                className={`h-12 w-full rounded-[4px] bg-[#f2f2f2] px-4 text-sm text-[#232323] outline-none transition ${
                  invalidFields.dueDate ? "ring-2 ring-red-400" : ""
                }`}
              />
              {!dueDate && (
                <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-[#9f9f9f]">
                  연.월.일
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="recipientName"
              className="text-xs font-semibold text-[#232323]"
            >
              받는 사람
            </label>
            <input
              id="recipientName"
              type="text"
              placeholder="예시: 할머니, 할아버지"
              value={recipientName}
              ref={(element) => {
                fieldRefs.current.recipientName = element;
              }}
              aria-invalid={Boolean(invalidFields.recipientName)}
              aria-describedby={invalidFields.recipientName ? "form-error" : undefined}
              onChange={(e) => {
                setRecipientName(e.target.value);
                clearInvalid("recipientName");
              }}
              className={`h-12 w-full rounded-[4px] bg-[#f2f2f2] px-4 text-sm text-[#232323] outline-none transition ${
                invalidFields.recipientName ? "ring-2 ring-red-400" : ""
              }`}
            />
          </div>

          <fieldset
            className="flex flex-col gap-3"
            aria-describedby={invalidFields.babyGender ? "form-error" : undefined}
          >
            <legend className="text-xs font-semibold text-[#232323]">아기 성별</legend>
            <div className="grid grid-cols-2 gap-3">
              <input
                id="gender-son"
                type="radio"
                name="babyGender"
                value="son"
                checked={babyGender === "son"}
                ref={(element) => {
                  fieldRefs.current.babyGender = element;
                }}
                aria-invalid={Boolean(invalidFields.babyGender)}
                aria-describedby={invalidFields.babyGender ? "form-error" : undefined}
                onChange={() => {
                  setBabyGender("son");
                  clearInvalid("babyGender");
                }}
                className="sr-only"
              />
              <label
                htmlFor="gender-son"
                className={`flex h-[50px] cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition ${
                  babyGender === "son"
                    ? "border-[#232323] bg-[#cae7ff] text-[#232323] ring-2 ring-[#232323] translate-x-1 -translate-y-1"
                    : "border-[#cae7ff] bg-[#cae7ff] text-[#232323]"
                } ${invalidFields.babyGender ? "ring-2 ring-red-400" : ""}`}
              >
                아들
              </label>

              <input
                id="gender-daughter"
                type="radio"
                name="babyGender"
                value="daughter"
                checked={babyGender === "daughter"}
                aria-invalid={Boolean(invalidFields.babyGender)}
                aria-describedby={invalidFields.babyGender ? "form-error" : undefined}
                onChange={() => {
                  setBabyGender("daughter");
                  clearInvalid("babyGender");
                }}
                className="sr-only"
              />
              <label
                htmlFor="gender-daughter"
                className={`flex h-[50px] cursor-pointer items-center justify-center rounded-xl border text-sm font-semibold transition ${
                  babyGender === "daughter"
                    ? "border-[#232323] bg-[#ffd2d2] text-[#232323] ring-2 ring-[#232323] translate-x-1 -translate-y-1"
                    : "border-[#ffd2d2] bg-[#ffd2d2] text-[#232323]"
                } ${invalidFields.babyGender ? "ring-2 ring-red-400" : ""}`}
              >
                딸
              </label>
            </div>
          </fieldset>

          {errorMessage && (
            <p id="form-error" role="alert" className="-mt-3 text-center text-xs font-medium text-red-500">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="h-[60px] w-full rounded-[4px] bg-[#232323] text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
          >
            {isLoading ? "링크 생성 중... ›" : "젠더리빌 풍선 만들기 ›"}
          </button>
        </form>

        {createdShareLink && (
          <ShareLinkDialog
            shareLink={createdShareLink}
            onClose={() => setCreatedShareLink(null)}
          />
        )}
      </section>
    </main>
  );
}
