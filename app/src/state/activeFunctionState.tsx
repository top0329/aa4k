// src/state/promptState.tsx
import { atom } from "jotai";
import { DockDisplayTypes } from "~/constants";

// AI実行中の機能がどれかを状態で管理（例：jsGen/js生成、dataGen/data生成）
export const ActiveFunctionState = atom<DockDisplayTypes>(null);
