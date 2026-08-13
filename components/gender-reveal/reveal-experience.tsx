"use client";

import { useReducer } from "react";
import { RevealRecord } from "@/lib/reveals/types";
import {
  initialInteractionState,
  interactionReducer,
} from "@/lib/reveals/interaction";
import BalloonInteraction from "./balloon-interaction";

export type RevealExperienceProps = {
  reveal: RevealRecord;
};

export default function RevealExperience({ reveal }: RevealExperienceProps) {
  const [state, dispatch] = useReducer(
    interactionReducer,
    initialInteractionState
  );

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white p-4 sm:p-6">
      <section className="flex w-[min(420px,100%)] flex-col items-center p-4">
        {state.phase === "interaction" && (
          <BalloonInteraction
            reveal={reveal}
            touchCount={state.touchCount}
            isBursting={state.isBursting}
            onTouch={() => dispatch({ type: "touch" })}
            onComplete={() => dispatch({ type: "completeBurst" })}
          />
        )}
        {state.phase === "result" && (
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold">결과 화면 (Task 8 구현 예정)</h2>
            <button
              onClick={() => dispatch({ type: "restart" })}
              className="mt-4 rounded-lg bg-gray-200 px-4 py-2 text-sm"
            >
              다시 하기
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
