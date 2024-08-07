// src/components/feature/CornerDialog/CornerDialog.tsx

import bannerButtonIcon from "~/assets/bannerButtonIcon.svg";
import * as Dialog from "@radix-ui/react-dialog";
import { Flex } from "@radix-ui/themes";
import { AnimatePresence, motion } from 'framer-motion';
import DragButton from "~/components/ui/DragButton/DragButton.tsx";
import "~/styles/scrollbar.css";
import { sDialogOverlay, sBannerButtonIcon } from './CornerDialog.css';
import AppGenerationDialog from "../AppGenerationDialog/AppGenerationDialog.tsx";
import ShowDetailDialog from "../ShowDetailDialog/ShowDetailDialog.tsx";
import { useCornerDialogLogic } from "./useCornerDialogLogic.tsx";

const CornerDialog = () => {

  // CornerDialogコンポーネントのロジックを管理するカスタムフック
  const {
    isAppDialogVisible,
    isShowDetailDialogVisible,
    setIsShowDetailDialogVisible,
    handleBannerClick,
    isBannerClicked,
    savePosition,
    savedPosition,
    humanMessage,
    setHumanMessage,
    setCallbackFuncs,
    aiAnswer,
    setAiAnswer,
    finishAiAnswer,
    setFinishAiAnswer,
    isBannerDisplay,
    showDetailDialogScrollRef,
  } = useCornerDialogLogic();

  if (!isBannerDisplay) return;
  return (
    <Dialog.Root
      open={isAppDialogVisible}
      modal={false} // ズームアップ・ズームアウトを可能にする為、外部要素とのやり取りを有効化
    >
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
      <Dialog.Overlay />
      <Dialog.Content
        className={sDialogOverlay}
        onInteractOutside={(e) => e.preventDefault()} //外部クリックを無効にする
      >
        <AnimatePresence>
          {/* ShowDetailDialogの表示にアニメーションを付ける（0.3秒で表示） */}
          {isAppDialogVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                visibility: isShowDetailDialogVisible ? 'visible' : 'hidden', // falseで要素を非表示にする
                height: isShowDetailDialogVisible ? 'auto' : '0', // falseでスペースを解放する
              }}
            >
              <ShowDetailDialog showDetailDialogScrollRef={showDetailDialogScrollRef} />
            </motion.div>
          )}
        </AnimatePresence>
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
                setCallbackFuncs={setCallbackFuncs}
                aiAnswer={aiAnswer}
                setAiAnswer={setAiAnswer}
                finishAiAnswer={finishAiAnswer}
                setFinishAiAnswer={setFinishAiAnswer}
                isShowDetailDialogVisible={isShowDetailDialogVisible}
                setIsShowDetailDialogVisible={setIsShowDetailDialogVisible}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CornerDialog;
