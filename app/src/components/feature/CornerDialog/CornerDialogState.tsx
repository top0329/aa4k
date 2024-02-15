// src/components/feature/CornerDialog/state.tsx
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { ChatHistory } from "~/types/ai";


// PC用の会話履歴
export const PcChatHistoryState = atomWithStorage<ChatHistory>(`PcChatHistory_App_${kintone.app.getId()}`, []);

// SP用の会話履歴
export const SpChatHistoryState = atomWithStorage<ChatHistory>(`SpChatHistory_App_${kintone.app.getId()}`, []);


// ビューモードの状態（trueでPC、falseでSP）
export const ViewModeState = atom(true);

export const LatestAiResponseIndexState = atom<number | null>(null);

export const InTypeWriteState = atom<boolean>(false);
