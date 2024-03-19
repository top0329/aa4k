// src/components/feature/Dock/useDockLogic.tsx
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { ChatMode, InfoMessage } from "~/constants";
import { IsChangeCodeState } from '~/state/codeActionState';
import { DockItemVisibleState } from "~/state/dockItemState";
import { ViewModeState } from "~/state/viewModeState";

export const useDockLogic = () => {
  const [dockState, setDockState] = useAtom(DockItemVisibleState);
  const [activeChatMode, setActiveChatMode] = useState<ChatMode>(ChatMode.desktopChat);
  const [isPcViewMode] = useAtom(ViewModeState);
  const [isChangeCode, setIsChangeCode] = useAtom(IsChangeCodeState);

  const updateKintonePointerEvents = () => {
    document.body.style.pointerEvents = dockState.dialogVisible && (dockState.chatVisible || dockState.spChatVisible) || dockState.codeEditorVisible ? 'none' : '';
  };

  // ページ遷移・リロードしてきた際に、pointerEvents判定をしたいので以下の処理を追加
  useEffect(() => {
    updateKintonePointerEvents();
  }, []);

  useEffect(() => {
    updateKintonePointerEvents();
  }, [dockState]);

  const toggleItemVisibility = (itemKey: keyof typeof dockState) => {
    setDockState({ ...dockState, [itemKey]: !dockState[itemKey] });
  };

  const initDockState = async () => {
    await setDockState({
      dialogVisible: false,
      chatVisible: false,
      codeEditorVisible: false,
      spChatVisible: false,
    });
    document.body.style.pointerEvents = '';
  };

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
    const shouldCloseDock = !dockState.codeEditorVisible || !isChangeCode || window.confirm(InfoMessage.I_MSG002);

    if (shouldCloseDock) {
      setIsChangeCode(false);
      initDockState();
    }
  };

  const deleteHistory = () => {
    // Implement the logic for deleting history if needed
  };

  return {
    isPcViewMode,
    activeChatMode,
    dockState,
    setDockState,
    toggleItemVisibility,
    toggleChatVisibility,
    toggleSpChatVisibility,
    deleteHistory,
    handleDockClose,
  };
};
