// src/state/chatHistoryState.tsx
import { atom } from "jotai";
import { ChatHistory } from "~/types";

/**
 * 会話履歴を管理するアトム
 */
export const ChatHistoryState = atom<ChatHistory>([]);
