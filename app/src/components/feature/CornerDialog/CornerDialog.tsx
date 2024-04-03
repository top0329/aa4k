// src/componetns/feature/CornerDialog/CornerDialog.tsx
import { faSparkles } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as Dialog from "@radix-ui/react-dialog";
import { Box, Flex } from "@radix-ui/themes";
import { motion } from 'framer-motion';
import { DockGroup } from "~/components/feature/Dock/Dock.css";
import Dock from "~/components/feature/Dock/Dock.tsx";
import DragButton from "~/components/ui/DragButton/DragButton.tsx";
import BarLoading from "~/components/ui/Loading/BarLoading/BarLoading";
import ChatSkeleton from "~/components/ui/Skeleton/ChatSkeleton";
import DockSkeleton from "~/components/ui/Skeleton/DockSkeleton";
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
    savePosition,
    savedPosition,
    humanMessage,
    setHumanMessage,
    setCallbackFuncs,
    aiAnswerRef,
    finishAiAnswerRef,
    isInitVisible,
    isInitialChatHistory,
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
        <Dialog.Trigger onClick={handleBannerClick} disabled={isBannerClicked}>
          <DragButton
            initialPosition={savedPosition}
            onPositionChange={savePosition}
          >

            <Flex style={{
              cursor: 'pointer',
            }}>
              <FontAwesomeIcon icon={faSparkles} color="white" />
            </Flex>
          </DragButton>
        </Dialog.Trigger>
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

          {dockState.chatVisible && isInitialChatHistory ? (
            <Chat
              isLoading={isLoading}
              startLoading={startLoading}
              stopLoading={stopLoading}
              isChangeCodeRef={isChangeCodeRef}
              humanMessage={humanMessage}
              setHumanMessage={setHumanMessage}
              setCallbackFuncs={setCallbackFuncs}
              aiAnswerRef={aiAnswerRef}
              finishAiAnswerRef={finishAiAnswerRef}
            />
          ) : null}
          {dockState.chatVisible && !isInitialChatHistory ? <ChatSkeleton /> : null}
          <BarLoading isLoading={isLoading} />

          {isInitVisible ? (
            <Dock setHumanMessage={setHumanMessage} isChangeCodeRef={isChangeCodeRef} />
          ) : (
            <Box className={DockGroup}>
              <DockSkeleton />
            </Box>
          )}
        </motion.div>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CornerDialog;
