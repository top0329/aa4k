// src/components/feature/Dock/Dock.tsx
import { faClose, faCode, faHistory, faMessageLines } from "@fortawesome/pro-duotone-svg-icons";
import { Box } from "@radix-ui/themes";
import IconTooltipButton from "~/components/ui/IconTooltipButton/IconTooltipButton";
import { vars } from "~/styles/theme.css";
import { DockGroup, DockInner, DockItem } from "./Dock.css";
import { useDockLogic } from "./useDockLogic";

const Dock = () => {
  const {
    isPcViewMode,
    activeChatMode,
    toggleChatVisibility,
    toggleItemVisibility,
    deleteHistory,
    initDockState,
  } = useDockLogic();

  return (
    <Box className={DockGroup}>
      <Box className={DockInner}>
        <IconTooltipButton
          icon={faCode}
          tooltip={'コードエディター'}
          onClick={() => toggleItemVisibility('codeEditorVisible')}
          className={DockItem} />
        <IconTooltipButton
          icon={faMessageLines}
          tooltip={'チャットを表示'}
          onClick={toggleChatVisibility}
          pressed={activeChatMode === 'pcChat'}
          pressedColor={
            isPcViewMode
              ? vars.color.indigoA.indigoA9
              : vars.color.crimsonA.crimsonA9
          }
          className={DockItem} />
        <IconTooltipButton
          icon={faHistory}
          tooltip={'履歴削除'}
          onClick={deleteHistory}
          className={DockItem} />
        <IconTooltipButton
          icon={faClose}
          tooltip={'閉じる'}
          onClick={initDockState}
          className={DockItem} />
      </Box>
    </Box>
  );
}

export default Dock;
