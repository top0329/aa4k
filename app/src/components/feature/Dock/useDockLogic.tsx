// src/components/feature/Dock/useDockLogic.tsx
import { useAtom } from "jotai";
import { useState } from "react";
import { ChatMode, InfoMessage } from "~/constants";
import { IsChangeCodeState } from '~/state/codeActionState';
import { DockItemVisibleState } from "~/state/dockItemState";
import { ViewModeState } from "~/state/viewModeState";

export const useDockLogic = () => {
  const [dockState, setDockState] = useAtom(DockItemVisibleState);
  const [activeChatMode, setActiveChatMode] = useState<ChatMode>(ChatMode.desktopChat);
  const [isPcViewMode] = useAtom(ViewModeState);
  const [isChangeCode, setIsChangeCode] = useAtom(IsChangeCodeState);

  const toggleItemVisibility = (itemKey: keyof typeof dockState) => {
    setDockState({ ...dockState, [itemKey]: !dockState[itemKey] });
  };

  const initDockState = () => {
    setDockState({
      dialogVisible: false,
      chatVisible: true,
      codeEditorVisible: false,
      spChatVisible: false,
    });
  }

  const toggleChatVisibility = () => {
    setDockState({
      ...dockState,
      chatVisible: !dockState.chatVisible,
      spChatVisible: false,
    });
    setActiveChatMode(ChatMode.desktopChat);
  };

  const toggleSpChatVisibility = () => {
    setDockState({
      ...dockState,
      chatVisible: false,
      spChatVisible: !dockState.spChatVisible,
    });
    setActiveChatMode(ChatMode.mobileChat);
  };

  // Docを閉じる処理
  const handleDockClose = () => {
    if (dockState.codeEditorVisible && isChangeCode) {
      // 編集中の編集モーダルを表示している場合、確認モーダルを表示
      if (window.confirm(InfoMessage.I_MSG002)) {
        setIsChangeCode(false);
        initDockState();
      }
    } else {
      initDockState();
    }
  }

  const deleteHistory = () => { }

  return {
    isPcViewMode,
    activeChatMode,
    dockState,
    setDockState,
    toggleItemVisibility,
    toggleChatVisibility,
    toggleSpChatVisibility,
    initDockState,
    deleteHistory,
    handleDockClose,
  };
}
