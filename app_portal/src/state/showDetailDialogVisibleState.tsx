// src\state\showDetailDialogVisibleState.tsx
import { atom } from "jotai";

/**
 * ダイアログの表示状態を管理するアトム
 * 
 * true: ダイアログが表示されている
 * false: ダイアログが非表示になっている
 */
export const ShowDetailDialogVisibleState = atom<boolean>(false)
