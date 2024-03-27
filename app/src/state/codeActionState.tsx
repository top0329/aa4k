// src/state/codeActionState.tsx
import { atom } from "jotai";

// PC用のコードエディタの内容
export const DesktopCodeState = atom<string>("");
// PC用の最後に保存されたコードエディタの内容
export const DesktopCodeLatestState = atom<string>("");
// PC用のコードエディタの変更フラグ
export const DesktopIsChangeCodeState = atom<boolean>(false);
// PC用のコードエディタの初期設定フラグ
export const DesktopIsInitialCodeState = atom<boolean>(false);

// SP用のコードエディタの内容
export const MobileDesktopCodeState = atom<string>("");
// SP用の最後に保存されたコードエディタの内容
export const MobileCodeLatestState = atom<string>("");
// SP用のコードエディタの変更フラグ
export const MobileIsChangeCodeState = atom<boolean>(false);
// SP用のコードエディタの初期設定フラグ
export const MobileIsInitialCodeState = atom<boolean>(false);
