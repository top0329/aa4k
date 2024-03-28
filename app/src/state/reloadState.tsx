// src/state/reloadState.tsx
import { atomWithStorage } from "jotai/utils";

// リロードフラグ
export const ReloadState = atomWithStorage<boolean>(
  `ReloadState_App_${kintone.app.getId()}`,
  false,
  undefined,
  {
    getOnInit: true
  }
);
