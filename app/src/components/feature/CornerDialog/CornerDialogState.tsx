// src/components/feature/CornerDialog/state.tsx
import { atom } from "jotai";
import { ChatHistory } from "~/types/ai";


// PC用の会話履歴
export const DesktopChatHistoryState = atom<ChatHistory>([]);

// SP用の会話履歴
export const MobileChatHistoryState = atom<ChatHistory>([]);


// ビューモードの状態（trueでPC、falseでSP）
export const ViewModeState = atom(true);

export const LatestAiResponseIndexState = atom<number | null>(null);

export const InTypeWriteState = atom<boolean>(false);

export const IsSubmittingState = atom<boolean>(false);

// TODO：ステート管理のリファクタリングで修正予定
export const PluginIdState = atom('');
