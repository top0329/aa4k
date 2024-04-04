// src/components/feature/Dock/useDockLogic.tsx
import { useAtom } from "jotai";
import { useEffect } from "react";
import { InfoMessage } from "~/constants";
import { useCodeAction } from "~/hooks/useCodeAction";
import useToggleDockItem from "~/hooks/useToggleDockItem";
import { DesktopIsChangeCodeState, MobileIsChangeCodeState } from '~/state/codeActionState';
import { ViewModeState } from "~/state/viewModeState";

type DockProps = {
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  isChangeCodeRef: React.MutableRefObject<boolean>;
}

export const useDockLogic = ({ setHumanMessage, isChangeCodeRef }: DockProps) => {
  const {
    dockState,
    setDockState,
    toggleItemVisibility,
    toggleChatVisibility,
  } = useToggleDockItem();
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

  const initDockState = async () => {
    await setDockState({
      dialogVisible: false,
      chatVisible: false,
      codeEditorVisible: false,
      spChatVisible: false,
    });
    document.body.style.pointerEvents = '';
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
    dockState,
    setDockState,
    toggleItemVisibility,
    toggleChatVisibility,
    deleteHistory,
    handleDockClose,
  };
};
