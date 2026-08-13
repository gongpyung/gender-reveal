"use client";

import { useState } from "react";
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
      <section className="flex w-[min(420px,100%)] flex-col items-center bg-white p-4 sm:p-5">
        <p className="m-0 text-[22px] font-bold tracking-wide text-[#232323]">
          Gender-Reveal
        </p>
        <h1 className="m-0 text-3xl sm:text-4xl font-extrabold text-[#232323]">
          Come on baby
        </h1>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="mt-6 flex w-full flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="babyNickname"
              className="text-xs font-semibold text-[#232323]"
            >
              아기 별명
            </label>
            <input
              id="babyNickname"
              type="text"
              placeholder="예) 깡총이"
              value={babyNickname}
              onChange={(e) => {
                setBabyNickname(e.target.value);
                clearInvalid("babyNickname");
              }}
              className={`h-12 w-full rounded-xl bg-[#f2f2f2] px-4 text-sm text-[#232323] outline-none transition ${
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
            <input
              id="dueDate"
              type="text"
              placeholder="YYYY-MM-DD"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                clearInvalid("dueDate");
              }}
              className={`h-12 w-full rounded-xl bg-[#f2f2f2] px-4 text-sm text-[#232323] outline-none transition ${
                invalidFields.dueDate ? "ring-2 ring-red-400" : ""
              }`}
            />
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
              placeholder="예) 할머니, 할아버지"
              value={recipientName}
              onChange={(e) => {
                setRecipientName(e.target.value);
                clearInvalid("recipientName");
              }}
              className={`h-12 w-full rounded-xl bg-[#f2f2f2] px-4 text-sm text-[#232323] outline-none transition ${
                invalidFields.recipientName ? "ring-2 ring-red-400" : ""
              }`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-[#232323]">성별</span>
            <div className="grid grid-cols-2 gap-3">
              <input
                id="gender-son"
                type="radio"
                name="babyGender"
                value="son"
                checked={babyGender === "son"}
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
                    ? "border-[#509fdf] bg-[#cae7ff]/30 text-[#509fdf]"
                    : "border-gray-200 bg-white text-[#232323]"
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
                    ? "border-[#ff9999] bg-[#ffd2d2]/30 text-[#ff9999]"
                    : "border-gray-200 bg-white text-[#232323]"
                } ${invalidFields.babyGender ? "ring-2 ring-red-400" : ""}`}
              >
                딸
              </label>
            </div>
          </div>

          {errorMessage && (
            <p className="mt-1 text-center text-xs font-medium text-red-500">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-[60px] w-full rounded-2xl bg-[#232323] text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
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
