// src/components/feature/Dock/Dock.tsx
import { faClose, faCode, faMessageLines } from "@fortawesome/pro-duotone-svg-icons";
import { Flex, Separator } from "@radix-ui/themes";
import clsx from "clsx";
import logoIcon from "~/assets/logo.svg";
import IconTooltipButton from "~/components/ui/IconTooltipButton/IconTooltipButton";
import { vars } from "~/styles/theme.css";
import { sDockGroup, sDockItem } from "./Dock.css";
import { useDockLogic } from "./useDockLogic";

type DockProps = {
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  isChangeCodeRef: React.MutableRefObject<boolean>;
}

const Dock: React.FC<DockProps> = ({ setHumanMessage, isChangeCodeRef }) => {
  const {
    isPcViewMode,
    dockState,
    toggleItemVisibility,
    toggleChatVisibility,
    handleDockClose,
  } = useDockLogic({ setHumanMessage, isChangeCodeRef });

  return (
    <Flex
      justify={'between'}
      className={clsx(sDockGroup, 'allow-zoom')}>
      <Flex>
        <img src={logoIcon} alt="logo" width={'40'} />
      </Flex>
      <Flex
        gap={'3'}
        justify={'center'}
        align={'center'}
      >
        <IconTooltipButton
          icon={faCode}
          tooltip={'コードエディター'}
          onClick={() => toggleItemVisibility('codeEditorVisible')}
          className={sDockItem}
          pressed={dockState.codeEditorVisible}
          pressedColor={
            isPcViewMode
              ? vars.color.primaryText
              : vars.color.accentSolidHover
          }
        />
        <Separator orientation="vertical" />
        <IconTooltipButton
          icon={faMessageLines}
          tooltip={'チャットを表示'}
          onClick={toggleChatVisibility}
          pressed={dockState.chatVisible || dockState.spChatVisible}
          pressedColor={
            isPcViewMode
              ? vars.color.primarySolidHover
              : vars.color.accentSolidHover
          }
          className={sDockItem} />
        <Separator orientation="vertical" />
        <IconTooltipButton
          icon={faClose}
          tooltip={'aa4kを閉じる'}
          onClick={handleDockClose}
          className={sDockItem}
        />

      </Flex>
    </Flex>
  );
}

export default Dock;
