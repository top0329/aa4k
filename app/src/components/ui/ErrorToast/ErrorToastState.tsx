// src/components/ui/ErrorToast/ErrorToastState.tsx
import { atom } from "jotai";

export type ToastMessage = {
  id?: string;
  message?: string;
  timeout?: number;
  isTimeout?: boolean;
}

// トーストメッセージのリストを管理するAtom
export const toastMessagesState = atom<ToastMessage[]>([]);
