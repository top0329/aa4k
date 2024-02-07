// src/components/feature/CornerDialog/state.tsx
import { atom } from 'jotai';
import { atomWithStorage } from "jotai/utils";
import { ChatHistory } from "~/types/ai";

export const ChatHistoryState = atomWithStorage<ChatHistory>(
  `ChatHistory_App_${kintone.app.getId()}`,
  [],
);

export const LatestAiResponseIndexState = atom<number | null>(null);

export const InTypeWriteState = atom<boolean>(false);
