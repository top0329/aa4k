// src/components/feature/Dock/useDockLogic.tsx
import { useAtom } from "jotai";
import { ViewModeState } from "../CornerDialog/CornerDialogState";
import { DockItemVisibleState, activeChatModeState } from "./DockState";

export const useDockLogic = () => {
  const [dockState, setDockState] = useAtom(DockItemVisibleState);
  const [activeChatMode, setActiveChatMode] = useAtom(activeChatModeState);
  const toggleItemVisibility = (itemKey: keyof typeof dockState) => {
    setDockState({ ...dockState, [itemKey]: !dockState[itemKey] });
  };

  const [
    isPcViewMode
  ] = useAtom(ViewModeState);

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
    setActiveChatMode('pcChat');
  };

  const toggleSpChatVisibility = () => {
    setDockState({
      ...dockState,
      chatVisible: false,
      spChatVisible: !dockState.spChatVisible,
    });
    setActiveChatMode('spChat');
  };

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
  };
}
