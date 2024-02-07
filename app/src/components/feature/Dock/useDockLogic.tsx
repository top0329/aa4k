import { useAtom } from "jotai";
import { ChatHistoryState } from "../CornerDialog/CornerDialogState";
import { DockItemVisibleState } from "./DockState";

export const useDockLogic = () => {
  const [dockState, setDockState] = useAtom(DockItemVisibleState);
  const [, setChatHistory] = useAtom(ChatHistoryState)
  const toggleItemVisibility = (itemKey: keyof typeof dockState) => {
    setDockState({ ...dockState, [itemKey]: !dockState[itemKey] });
  };

  const initDockState = () => {
    setDockState({
      dialogVisible: false,
      chatVisible: true,
      codeEditorVisible: false,
    });
  }

  const deleteHistory = () => {
    setChatHistory([]);
  }

  return {
    dockState,
    setDockState,
    toggleItemVisibility,
    initDockState,
    deleteHistory,
  };
}
