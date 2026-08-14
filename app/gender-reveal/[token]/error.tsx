"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-white p-6">
      <section className="flex w-[min(420px,100%)] flex-col items-center gap-5 text-center">
        <h1 className="font-pixel text-2xl text-[#232323]">링크를 불러오지 못했어요</h1>
        <button
          type="button"
          onClick={() => reset()}
          className="h-[60px] w-full rounded-2xl bg-[#232323] text-sm font-semibold text-white"
        >
          다시 시도하기
        </button>
      </section>
    </main>
  );
}
