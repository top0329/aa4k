// src/hooks/useToggleDockItem.tsx
import { useAtom } from "jotai";
import { DockItemVisibleState } from "~/state/dockItemState";
import { ViewModeState } from "~/state/viewModeState";

//
const useToggleDockItem = () => {
  const [dockState, setDockState] = useAtom(DockItemVisibleState);
  const [isPcViewMode] = useAtom(ViewModeState);

  const toggleItemVisibility = (itemKey: keyof typeof dockState) => {
    setDockState({ ...dockState, [itemKey]: !dockState[itemKey] });
  };

  const toggleChatVisibility = () => {
    console.log(isPcViewMode);
    isPcViewMode ? toggleItemVisibility('chatVisible') : toggleItemVisibility('spChatVisible');
  };

  return {
    dockState,
    setDockState,
    toggleItemVisibility,
    toggleChatVisibility,
  };
}


export default useToggleDockItem;
