// src/components/feature/Dock/Dock.tsx
import { faClose, faCode, faHistory, faMessageLines } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box } from "@radix-ui/themes";
import { useAtom } from "jotai";
import { DockGroup, DockIcon, DockInner, DockItem } from "./Dock.css";
import { DockItemVisibleState } from "./DockState";

const Dock = () => {
  const [dockState, setDockState] = useAtom(DockItemVisibleState);
  const toggleItemVisibility = (itemKey: keyof typeof dockState) => {
    setDockState({ ...dockState, [itemKey]: !dockState[itemKey] });
  };

  return (
    <Box className={DockGroup}>
      <Box className={DockInner}>
        <Box className={DockItem} onClick={() => toggleItemVisibility('codeEditorVisible')}>
          <FontAwesomeIcon icon={faCode} size="lg" className={DockIcon} />
        </Box>
        <Box className={DockItem} onClick={() => toggleItemVisibility('chatVisible')}>
          <FontAwesomeIcon icon={faMessageLines} size="lg" className={DockIcon} />
        </Box>
        <Box className={DockItem} onClick={() => toggleItemVisibility('chatVisible')}>
          <FontAwesomeIcon icon={faHistory} size="lg" className={DockIcon} />
        </Box>
        <Box className={DockItem} onClick={() => toggleItemVisibility('chatVisible')}>
          <FontAwesomeIcon icon={faClose} size="lg" className={DockIcon} />
        </Box>

      </Box>
    </Box>
  );
}

export default Dock;
