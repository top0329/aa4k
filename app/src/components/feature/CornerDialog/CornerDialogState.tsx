// src/components/feature/CornerDialog/state.tsx
import { atomWithStorage } from "jotai/utils";
import { ChatHistory } from "~/types/agents";

export const ChatHistoryState = atomWithStorage<ChatHistory>(
  `ChatHistory_App_${kintone.app.getId()}`,
  [],
);
