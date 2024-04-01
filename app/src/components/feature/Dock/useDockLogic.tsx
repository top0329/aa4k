// src/components/feature/Dock/useDockLogic.tsx
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { ChatMode, InfoMessage } from "~/constants";
import { useCodeAction } from "~/hooks/useCodeAction";
import { DesktopIsChangeCodeState, MobileIsChangeCodeState } from '~/state/codeActionState';
import { DockItemVisibleState } from "~/state/dockItemState";
import { ViewModeState } from "~/state/viewModeState";

type DockProps = {
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  isChangeCodeRef: React.MutableRefObject<boolean>;
}

export const useDockLogic = ({ setHumanMessage, isChangeCodeRef }: DockProps) => {
  const [dockState, setDockState] = useAtom(DockItemVisibleState);
  const [activeChatMode, setActiveChatMode] = useState<ChatMode>(ChatMode.desktopChat);
  const [isPcViewMode, setIsPcViewMode] = useAtom(ViewModeState);
  const [isDesktopChangeCode] = useAtom(DesktopIsChangeCodeState);
  const [isMobileChangeCode] = useAtom(MobileIsChangeCodeState);

  const { initCodeActionState } = useCodeAction(isPcViewMode);

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
    const shouldCloseDock = (!isDesktopChangeCode && !isMobileChangeCode) || window.confirm(InfoMessage.I_MSG002);

    if (shouldCloseDock) {
      setHumanMessage("");
      setIsPcViewMode(true);
      initCodeActionState();
      isChangeCodeRef.current = false;
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
