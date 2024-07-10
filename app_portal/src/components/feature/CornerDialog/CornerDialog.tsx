// src/components/feature/CornerDialog/CornerDialog.tsx

import bannerButtonIcon from "~/assets/bannerButtonIcon.svg";
import * as Dialog from "@radix-ui/react-dialog";
import { Flex } from "@radix-ui/themes";
import { AnimatePresence, motion } from 'framer-motion';
import DragButton from "~/components/ui/DragButton/DragButton.tsx";
import "~/styles/scrollbar.css";
import { sDialogOverlay, sBannerButtonIcon } from './CornerDialog.css';
import AppGenerationDialog from "../AppGenerationDialog/AppGenerationDialog.tsx";
import { useCornerDialogLogic } from "./useCornerDialogLogic.tsx";

const CornerDialog = () => {

  // CornerDialogコンポーネントのロジックを管理するカスタムフック
  const {
    isAppDialogVisible,
    handleBannerClick,
    isBannerClicked,
    savePosition,
    savedPosition,
    humanMessage,
    setHumanMessage,
    // setCallbackFuncs,
    aiAnswerRef,
    finishAiAnswerRef,
  } = useCornerDialogLogic();

  return (
    <Dialog.Root open={isAppDialogVisible} >
      <motion.div
        initial={{ opacity: 0 }}
        animate={isAppDialogVisible ? { opacity: 0 } : { opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Dialog.Trigger asChild>
          <DragButton
            isVisible={!isAppDialogVisible}
            initialPosition={savedPosition}
            onPositionChange={savePosition}
            onClick={event => handleBannerClick(event)}
            disabled={isBannerClicked}
          >
            <Flex style={{
              cursor: 'pointer',
            }}>
              <Flex>
                <img src={bannerButtonIcon} alt="icon" className={sBannerButtonIcon} />
              </Flex>
            </Flex>
          </DragButton>
        </Dialog.Trigger>
      </motion.div>
      <Dialog.Overlay className={sDialogOverlay} />
      <Dialog.Content
        onInteractOutside={(e) => e.preventDefault()} //外部クリックを無効にする
      >
        <AnimatePresence>
          {/* AppGenerationDialogの表示にアニメーションを付ける（0.3秒で表示） */}
          {isAppDialogVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AppGenerationDialog
                humanMessage={humanMessage}
                setHumanMessage={setHumanMessage}
                // setCallbackFuncs={setCallbackFuncs}
                aiAnswerRef={aiAnswerRef}
                finishAiAnswerRef={finishAiAnswerRef}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CornerDialog;
