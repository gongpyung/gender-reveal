"use client";

import { useReducer } from "react";
import { RevealRecord } from "@/lib/reveals/types";
import {
  initialInteractionState,
  interactionReducer,
} from "@/lib/reveals/interaction";
import BalloonInteraction from "./balloon-interaction";
import RevealResult from "./reveal-result";

export type RevealExperienceProps = {
  reveal: RevealRecord;
};

export default function RevealExperience({ reveal }: RevealExperienceProps) {
  const [state, dispatch] = useReducer(
    interactionReducer,
    initialInteractionState
  );

  const handleCreateNew = () => {
    window.location.assign("/gender-reveal");
  };

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
          <RevealResult
            reveal={reveal}
            onReplay={() => dispatch({ type: "restart" })}
            onCreateNew={handleCreateNew}
          />
        )}
      </section>
    </main>
  );
}
