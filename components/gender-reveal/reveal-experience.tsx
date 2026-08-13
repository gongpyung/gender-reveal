"use client";

import { RevealRecord } from "@/lib/reveals/types";

export type RevealExperienceProps = {
  reveal: RevealRecord;
};

export default function RevealExperience({ reveal }: RevealExperienceProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white p-4 sm:p-6">
      <section className="flex w-[min(420px,100%)] flex-col items-center p-4">
        <h1 className="text-center text-2xl font-bold leading-tight text-[#232323]">
          {reveal.babyNickname}는<br />
          아들일까요? 딸일까요?
        </h1>
        <div className="mt-8 flex flex-col items-center">
          <p className="text-sm font-semibold text-[#9f9f9f]">0 / 10</p>
        </div>
      </section>
    </main>
  );
}
