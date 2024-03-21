// src/state/viewModeState.tsx
import { atomWithStorage } from "jotai/utils";

// ビューモードの状態（trueでPC、falseでSP）
export const ViewModeState = atomWithStorage<boolean>(
  `ViewMode_App_${kintone.app.getId()}`,
  true,
);
