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
    humanMessage,
    setHumanMessage,
  } = useCornerDialogLogic();

  return (
    <Dialog.Root open={dockState.dialogVisible}
      onOpenChange={async (open) => {
        if (!open) {
          document.body.style.pointerEvents = '';
        }
      }}
      modal={dockState.dialogVisible && (dockState.chatVisible || dockState.spChatVisible) || dockState.codeEditorVisible ? true : false}
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
      <Dialog.Overlay />
      <Dialog.Content onPointerDownOutside={(e) => e.preventDefault()}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {dockState.codeEditorVisible && (
            <CodeEditor isChangeCodeRef={isChangeCodeRef} isLoading={isLoading} />
          )}

          {dockState.chatVisible && (
            <Chat
              isLoading={isLoading}
              startLoading={startLoading}
              stopLoading={stopLoading}
              isChangeCodeRef={isChangeCodeRef}
              humanMessage={humanMessage}
              setHumanMessage={setHumanMessage}
            />
          )}
          <BarLoading isLoading={isLoading} />
          <Dock />
        </motion.div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CornerDialog;
