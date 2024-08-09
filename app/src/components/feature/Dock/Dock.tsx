// src/components/feature/Dock/Dock.tsx
import { faClose, faCode, faMessageLines, IconDefinition } from "@fortawesome/pro-duotone-svg-icons";
import { Button, Flex, Separator, Tooltip } from "@radix-ui/themes";
import clsx from "clsx";
import { DockDisplayTypes } from "~/constants";
import logoIcon from "~/assets/logo.svg";
import jsGenIcon from "~/assets/jsGenIcon.svg";
import jsGenPressedIcon from "~/assets/jsGenPressedIcon.svg";
import dataGenIcon from "~/assets/dataGenIcon.svg";
import dataGenPressedIcon from "~/assets/dataGenPressedIcon.svg";
import IconTooltipButton from "~/components/ui/IconTooltipButton/IconTooltipButton";
import { vars } from "~/styles/theme.css";
import { sDockGroup, sDockItem, sControlBtn } from "./Dock.css";
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
    dockDisplayType,
    handleJsGenClick,
    handleDataGenClick,
  } = useDockLogic({ setHumanMessage, isChangeCodeRef });

  const { jsGen, dataGen } = DockDisplayTypes;

  // ツールチップボタンを表示する共通関数
  const renderIconTooltipButton = (
    icon: IconDefinition,
    tooltip: string,
    onClick: () => void,
    pressed: boolean,
    pressedColor: string | undefined
  ) => (
    <IconTooltipButton
      icon={icon}
      tooltip={tooltip}
      onClick={onClick}
      pressed={pressed}
      pressedColor={pressedColor}
      className={sDockItem}
    />
  );

  return (
    <Flex
      justify={'between'}
      className={clsx(sDockGroup, 'allow-zoom')}>
      <Flex align={'center'} gap={'4'}>
        <img src={logoIcon} alt="logo" width={'70'} />
        <Separator orientation="vertical" />
        <Button
          style={{
            width: 40,
            height: 40,
            borderRadius: `50%`,
            padding: 0,
            cursor: 'pointer',
          }}
          color={'gray'}
          variant={'ghost'}
          className={sControlBtn}
          onClick={handleJsGenClick}
        >
          <Tooltip
            content={"JS生成"}
            style={{
              zIndex: 10000,
            }}
          >
            <img src={dockDisplayType === jsGen ? jsGenPressedIcon : jsGenIcon} alt="icon" style={{ width: '28px', height: '28px' }} />
          </Tooltip>
        </Button>
        <Separator orientation="vertical" />
        <Button
          style={{
            width: 40,
            height: 40,
            borderRadius: `50%`,
            padding: 0,
            cursor: 'pointer',
          }}
          color={'gray'}
          variant={'ghost'}
          className={sControlBtn}
          onClick={handleDataGenClick}
        >
          <Tooltip
            content={"ダミーデータ生成"}
            style={{
              zIndex: 10000,
            }}
          >
            <img src={dockDisplayType === dataGen ? dataGenPressedIcon : dataGenIcon} alt="icon" style={{ width: '32px', height: '32px' }} />
          </Tooltip>
        </Button>
      </Flex>
      <Flex
        gap={'3'}
        justify={'center'}
        align={'center'}
      >
        {dockDisplayType === jsGen ? (
          <>
            {renderIconTooltipButton(
              faCode,
              'コードエディター',
              () => toggleItemVisibility('codeEditorVisible'),
              dockState.codeEditorVisible,
              isPcViewMode ? vars.color.primaryText : vars.color.accentSolidHover
            )}
            <Separator orientation="vertical" />
            {renderIconTooltipButton(
              faMessageLines,
              'チャットを表示',
              toggleChatVisibility,
              dockState.chatVisible || dockState.spChatVisible,
              isPcViewMode ? vars.color.primarySolidHover : vars.color.accentSolidHover
            )}
            <Separator orientation="vertical" />
          </>
        ) : dockDisplayType === dataGen ? (
          <>
            {renderIconTooltipButton(
              faMessageLines,
              'チャットを表示',
              toggleChatVisibility,
              dockState.chatVisible || dockState.spChatVisible,
              isPcViewMode ? vars.color.primarySolidHover : vars.color.accentSolidHover
            )}
            <Separator orientation="vertical" />
          </>
        ) : null}
        {renderIconTooltipButton(
          faClose,
          'aa4kを閉じる',
          handleDockClose,
          false,
          undefined
        )}
      </Flex>
    </Flex>
  );
}

export default Dock;
