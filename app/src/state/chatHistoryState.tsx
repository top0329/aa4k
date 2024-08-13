// src/state/chatHistoryState.tsx
import { atom } from "jotai";
import { ChatHistory } from "~/types/ai";

// --------------------
// js生成
// --------------------
// PC用の会話履歴
export const DesktopChatHistoryState = atom<ChatHistory>([]);

// SP用の会話履歴
export const MobileChatHistoryState = atom<ChatHistory>([]);

// --------------------
// data生成
// --------------------
// 会話履歴
export const DataGenChatHistoryState = atom<ChatHistory>([]);
