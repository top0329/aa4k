// src/componetns/feature/CornerDialog/CornerDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { Flex } from "@radix-ui/themes";
import logoSVG from "~/assets/logo.svg";
import Dock from "~/components/feature/Dock/Dock.tsx";
import BarLoading from "~/components/ui/Loading/BarLoading/BarLoading";
import "~/styles/scrollbar.css";
import Chat from "../Chat/Chat.tsx";
import CodeEditor from "../CodeEditor/CodeEditor.tsx";
import { DialogOverlay } from "./CornerDialog.css";
import { useCornerDialogLogic } from "./useCornerDialogLogic.tsx";

const CornerDialog = () => {
  const {
    dockState,
    handleBannerClick,
    isBannerClicked,
    isLoading,
    startLoading,
    stopLoading,
    isChangeCodeRef
  } = useCornerDialogLogic();

  return (
    <Dialog.Root open={dockState.dialogVisible}>
      <Dialog.Trigger onClick={handleBannerClick} disabled={isBannerClicked}>
        <Flex style={{
          cursor: 'pointer',
        }}>
          <img src={logoSVG} alt="logo" width={'48'} />
        </Flex>
      </Dialog.Trigger>
      <Dialog.Overlay className={DialogOverlay} />
      <Dialog.Content onPointerDownOutside={(e) => e.preventDefault()}>

        {dockState.codeEditorVisible && (
          <CodeEditor isChangeCodeRef={isChangeCodeRef} />
        )}

        {dockState.chatVisible && (
          <Chat isLoading={isLoading} startLoading={startLoading} stopLoading={stopLoading} isChangeCodeRef={isChangeCodeRef} />
        )}
        <BarLoading isLoading={isLoading} />
        <Dock />
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CornerDialog;
