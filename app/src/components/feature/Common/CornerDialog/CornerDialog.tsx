// src/components/feature/Common/CornerDialog/CornerDialog.tsx

import bannerButtonIcon from "~/assets/bannerButtonIcon.svg";
import * as Dialog from "@radix-ui/react-dialog";
import { Box, Flex } from "@radix-ui/themes";
import { AnimatePresence, motion } from 'framer-motion';
import { sDockGroup } from "~/components/feature/Common/Dock/Dock.css";
import DragButton from "~/components/ui/Origin/DragButton/DragButton.tsx";
import BarLoading from "~/components/ui/Origin/Loading/BarLoading/BarLoading";
import ChatSkeleton from "~/components/ui/Origin/Skeleton/ChatSkeleton";
import DockSkeleton from "~/components/ui/Origin/Skeleton/DockSkeleton";
import "~/styles/scrollbar.css";
import Chat from "../../JsGen/Chat/Chat.tsx";
import Chat_DataGen from "../../DataGen/Chat/Chat.tsx";
import CodeEditor from "../../JsGen/CodeEditor/CodeEditor.tsx";
import Dock from "../Dock/Dock.tsx";
import { useCornerDialogLogic } from "./useCornerDialogLogic.tsx";
import { sBannerButtonIcon } from "./CornerDialog.css.ts";

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
    isInitialDataGenChatHistory,
    isPcViewMode,
    isBannerDisplay,
  } = useCornerDialogLogic();

  if (!isBannerDisplay) return;
  return (
    <Dialog.Root open={dockState.dialogVisible}
      modal={false}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={dockState.dialogVisible ? { opacity: 0 } : { opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Dialog.Trigger asChild>
          <DragButton
            isVisible={!dockState.dialogVisible}
            initialPosition={savedPosition}
            onPositionChange={savePosition}
            onClick={event => handleBannerClick(event)}
            disabled={isBannerClicked}
          >
            <Flex style={{
              cursor: 'pointer',
            }}>
              <img src={bannerButtonIcon} alt="icon" className={sBannerButtonIcon} />
            </Flex>
          </DragButton>
        </Dialog.Trigger>
      </motion.div>
      <Dialog.Overlay />
      <Dialog.Content>
        <AnimatePresence>
          {dockState.codeEditorVisible && !dockState.dataGenChatVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CodeEditor isChangeCodeRef={isChangeCodeRef} isLoading={isLoading} />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isPcViewMode && dockState.chatVisible && !dockState.dataGenChatVisible && isInitialChatHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isPcViewMode && dockState.spChatVisible && isInitialChatHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isPcViewMode && dockState.dataGenChatVisible && !dockState.chatVisible && isInitialDataGenChatHistory && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Chat_DataGen
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
            </motion.div>
          )}
        </AnimatePresence>
        {dockState.chatVisible && !dockState.dataGenChatVisible && !isInitialChatHistory ? <ChatSkeleton /> : null}
        {dockState.dataGenChatVisible && !dockState.chatVisible && !isInitialDataGenChatHistory ? <ChatSkeleton /> : null}
        <BarLoading isLoading={isLoading} />
        {isInitVisible ? (
          <Dock setHumanMessage={setHumanMessage} isChangeCodeRef={isChangeCodeRef} />
        ) : (
          <Box className={sDockGroup} px={'0'}>
            <DockSkeleton />
          </Box>
        )}

      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CornerDialog;
