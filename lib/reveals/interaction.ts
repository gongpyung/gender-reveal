export type InteractionPhase = "interaction" | "result";

export type InteractionState = {
  phase: InteractionPhase;
  touchCount: number;
  isBursting: boolean;
};

export type InteractionAction =
  | { type: "touch" }
  | { type: "completeBurst" }
  | { type: "restart" };

export const initialInteractionState: InteractionState = {
  phase: "interaction",
  touchCount: 0,
  isBursting: false,
};

export function interactionReducer(
  state: InteractionState,
  action: InteractionAction
): InteractionState {
  switch (action.type) {
    case "touch": {
      if (
        state.phase !== "interaction" ||
        state.isBursting ||
        state.touchCount >= 10
      ) {
        return state;
      }
      const newCount = state.touchCount + 1;
      return {
        ...state,
        touchCount: newCount,
        isBursting: newCount === 10,
      };
    }
    case "completeBurst": {
      if (state.phase !== "interaction" || !state.isBursting) {
        return state;
      }
      return {
        phase: "result",
        touchCount: 10,
        isBursting: false,
      };
    }
    case "restart": {
      return initialInteractionState;
    }
    default:
      return state;
  }
}
