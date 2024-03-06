// src/state/codeActionState.tsx
import { atom } from "jotai";

// コードエディタの内容
export const CodeState = atom<string>("");
// 最後に保存されたコードエディタの内容
export const CodeLatestState = atom<string>("");
// コードエディタの変更フラグ
export const IsChangeCodeState = atom<boolean>(false);
