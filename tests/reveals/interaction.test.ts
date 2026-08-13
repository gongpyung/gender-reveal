import { describe, expect, it } from "vitest";
import {
  initialInteractionState,
  interactionReducer,
} from "@/lib/reveals/interaction";

describe("interactionReducer", () => {
  it("increments touchCount up to 9 without bursting", () => {
    let state = initialInteractionState;
    for (let i = 1; i <= 9; i++) {
      state = interactionReducer(state, { type: "touch" });
      expect(state.touchCount).toBe(i);
      expect(state.isBursting).toBe(false);
      expect(state.phase).toBe("interaction");
    }
  });

  it("sets touchCount 10 and isBursting true on tenth touch", () => {
    let state = initialInteractionState;
    for (let i = 0; i < 9; i++) {
      state = interactionReducer(state, { type: "touch" });
    }
    state = interactionReducer(state, { type: "touch" });
    expect(state.touchCount).toBe(10);
    expect(state.isBursting).toBe(true);
    expect(state.phase).toBe("interaction");

    // 11th touch is ignored
    const nextState = interactionReducer(state, { type: "touch" });
    expect(nextState).toBe(state);
  });

  it("moves to result phase on completeBurst only when bursting", () => {
    let state = initialInteractionState;
    // completeBurst before bursting should do nothing
    expect(interactionReducer(state, { type: "completeBurst" })).toBe(state);

    for (let i = 0; i < 10; i++) {
      state = interactionReducer(state, { type: "touch" });
    }
    state = interactionReducer(state, { type: "completeBurst" });
    expect(state.phase).toBe("result");
    expect(state.isBursting).toBe(false);
    expect(state.touchCount).toBe(10);
  });

  it("resets to initial state on restart", () => {
    let state = initialInteractionState;
    for (let i = 0; i < 10; i++) {
      state = interactionReducer(state, { type: "touch" });
    }
    state = interactionReducer(state, { type: "completeBurst" });
    expect(state.phase).toBe("result");

    state = interactionReducer(state, { type: "restart" });
    expect(state).toEqual(initialInteractionState);
  });
});
