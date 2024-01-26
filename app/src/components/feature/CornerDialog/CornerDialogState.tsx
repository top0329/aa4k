// src/components/feature/CornerDialog/state.tsx
import { atomWithStorage } from "jotai/utils";
import { ChatHistory } from "~/types/agents";

export const DialogOpenState = atomWithStorage<boolean>(
  `DialogOpen_App_${kintone.app.getId()}`,
  false,
);

export const ChatOpenState = atomWithStorage<boolean>(
  `ChatOpen_App_${kintone.app.getId()}`,
  false,
);
export const ChatHistoryState = atomWithStorage<ChatHistory>(
  `ChatHistory_App_${kintone.app.getId()}`,
  [],
);
