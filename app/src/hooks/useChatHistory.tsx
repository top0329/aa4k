// src/hooks/useChatHistory.ts
import { useAtom } from "jotai";
import { DesktopChatHistoryState, MobileChatHistoryState } from "~/state/chatHistoryState";

export const useChatHistory = (isPcViewMode: boolean) => {
  const [desktopChatHistory, setDesktopChatHistory] = useAtom(DesktopChatHistoryState);
  const [mobileChatHistory, setMobileChatHistory] = useAtom(MobileChatHistoryState);

  // 現在のビューモードに基づいて適切なチャット履歴とセッター関数を返す
  const chatHistoryItems = isPcViewMode ? desktopChatHistory : mobileChatHistory;
  const setChatHistory = isPcViewMode ? setDesktopChatHistory : setMobileChatHistory;

  return { chatHistoryItems, setChatHistory };
};
