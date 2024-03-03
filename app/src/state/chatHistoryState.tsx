// src/state/chatHistoryState.tsx
import { atom } from "jotai";
import { ChatHistory } from "~/types/ai";

// PC用の会話履歴
export const DesktopChatHistoryState = atom<ChatHistory>([]);

// SP用の会話履歴
export const MobileChatHistoryState = atom<ChatHistory>([]);
