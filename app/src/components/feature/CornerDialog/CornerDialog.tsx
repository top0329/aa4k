// src/componetns/feature/CornerDialog/CornerDialog.tsx
import { faSparkles } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Dialog from "@radix-ui/react-dialog";
import { Flex } from "@radix-ui/themes";
import { motion } from 'framer-motion';
import Dock from "~/components/feature/Dock/Dock.tsx";
import DragButton from "~/components/ui/DragButton/DragButton.tsx";
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
    isChangeCodeRef,
    initialPosition,
    savePosition,
  } = useCornerDialogLogic();

  return (
    <Dialog.Root open={dockState.dialogVisible}
      onOpenChange={async (open) => {
        console.log('open', open);
        if (!open) {
          document.body.style.pointerEvents = '';
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={dockState.dialogVisible ? { opacity: 0 } : { opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <DragButton initialPosition={initialPosition} onPositionChange={savePosition}>
          <Dialog.Trigger onClick={handleBannerClick} disabled={isBannerClicked}>
            <Flex style={{
              cursor: 'pointer',
            }}>
              <FontAwesomeIcon icon={faSparkles} color="white" />
            </Flex>
          </Dialog.Trigger>
        </DragButton>
      </motion.div>
      <Dialog.Overlay className={DialogOverlay} />
      <Dialog.Content onPointerDownOutside={(e) => e.preventDefault()}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {dockState.codeEditorVisible && (
            <CodeEditor isChangeCodeRef={isChangeCodeRef} />
          )}

          {dockState.chatVisible && (
            <Chat isLoading={isLoading} startLoading={startLoading} stopLoading={stopLoading} isChangeCodeRef={isChangeCodeRef} />
          )}
          <BarLoading isLoading={isLoading} />
          <Dock />
        </motion.div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CornerDialog;
