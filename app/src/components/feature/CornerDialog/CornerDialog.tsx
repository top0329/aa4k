// src/componetns/feature/CornerDialog/CornerDialog.tsx

import bannerButtonIcon from "~/assets/bannerButtonIcon.svg";
import * as Dialog from "@radix-ui/react-dialog";
import { Box, Flex } from "@radix-ui/themes";
import { AnimatePresence, motion } from 'framer-motion';
import { sDockGroup } from "~/components/feature/Dock/Dock.css";
import DragButton from "~/components/ui/DragButton/DragButton.tsx";
import BarLoading from "~/components/ui/Loading/BarLoading/BarLoading";
import ChatSkeleton from "~/components/ui/Skeleton/ChatSkeleton";
import DockSkeleton from "~/components/ui/Skeleton/DockSkeleton";
import "~/styles/scrollbar.css";
import Chat from "../Chat/Chat.tsx";
import CodeEditor from "../CodeEditor/CodeEditor.tsx";
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
    isPcViewMode,
  } = useCornerDialogLogic();

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
          {dockState.codeEditorVisible && (
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
          {isPcViewMode && dockState.chatVisible && isInitialChatHistory && (
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
        {dockState.chatVisible && !isInitialChatHistory ? <ChatSkeleton /> : null}
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
