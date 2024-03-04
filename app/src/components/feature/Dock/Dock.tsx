// src/components/feature/Dock/Dock.tsx
import { faClose, faCode, faMessageLines } from "@fortawesome/pro-duotone-svg-icons";
import { Box, Flex } from "@radix-ui/themes";
import logoIcon from "~/assets/logo.svg";
import { useCodeEditorLogic } from "~/components/feature/CodeEditor/useCodeEditorLogic";
import IconTooltipButton from "~/components/ui/IconTooltipButton/IconTooltipButton";
import { ChatMode } from "~/constants";
import { vars } from "~/styles/theme.css";
import { DockGroup, DockItem } from "./Dock.css";
import { useDockLogic } from "./useDockLogic";

const Dock = () => {
  const {
    isPcViewMode,
    activeChatMode,
    toggleChatVisibility,
    initDockState,
  } = useDockLogic();
  const { handleCodeEditorClick } = useCodeEditorLogic();

  return (
    <Box className={DockGroup}>
      <Flex>
        <img src={logoIcon} alt="logo" width={'40'} />
      </Flex>
      <Flex
        gap={'4'}
      >
        <IconTooltipButton
          icon={faCode}
          tooltip={'コードエディター'}
          onClick={handleCodeEditorClick}
          className={DockItem} />
        <IconTooltipButton
          icon={faMessageLines}
          tooltip={'チャットを表示'}
          onClick={toggleChatVisibility}
          pressed={activeChatMode === ChatMode.desktopChat}
          pressedColor={
            isPcViewMode
              ? vars.color.primaryFocus
              : vars.color.accentFocus
          }
          className={DockItem} />
        <IconTooltipButton
          icon={faClose}
          tooltip={'閉じる'}
          onClick={initDockState}
          className={DockItem} />
      </Flex>
    </Box>
  );
}

export default Dock;
