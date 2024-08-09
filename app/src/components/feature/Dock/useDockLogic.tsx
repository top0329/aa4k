// src/components/feature/Dock/useDockLogic.tsx
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { InfoMessage, DockDisplayTypes } from "~/constants";
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
  const [dockDisplayType, setDockDisplayType] = useState<DockDisplayTypes>(null);

  const { jsGen, dataGen } = DockDisplayTypes;

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

  // js操作アイコンを押下した処理
  const handleJsGenClick = () => {
    setDockDisplayType(jsGen);
    console.log("JS生成");
  };

  // data操作アイコンを押下した処理
  const handleDataGenClick = () => {
    setDockDisplayType(dataGen);
    console.log("data生成");
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
    dockDisplayType,
    handleJsGenClick,
    handleDataGenClick,
  };
};
