// src/components/feature/AppGenerationDialog/AppGenerationDialog.tsx

// import React from "react";
// import clsx from "clsx";
import { Box } from "@radix-ui/themes";
import { useAppGenerationDialogLogic } from "./useAppGenerationDialogLogic";
import CloseButton from "~/components/ui/CloseButton/CloseButton";
import ChatHistory from "../ChatHistory/ChatHistory";
import PromptForm from "../PromptForm/PromptForm";
import { sAppGenerationDialog, sOuterFrame, sMiddleFrame } from "./AppGenerationDialog.css";

type AppGenerationDialogProps = {
  humanMessage: string;
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  // setCallbackFuncs: React.Dispatch<React.SetStateAction<Function[] | undefined>>;
  aiAnswerRef: React.MutableRefObject<string>;
  finishAiAnswerRef: React.MutableRefObject<boolean>;
}

const AppGenerationDialog: React.FC<AppGenerationDialogProps> = ({ humanMessage, setHumanMessage, aiAnswerRef, finishAiAnswerRef }) => {

  // AppGenerationDialogコンポーネントのロジックを管理するカスタムフック
  const {
    scrollRef,
    toggleDialogVisibility,
    isInitVisible,
    setIsInitVisible,
  } = useAppGenerationDialogLogic();

  return (
    <Box className={sOuterFrame}>
      <Box className={sMiddleFrame}>
        <Box className={sAppGenerationDialog} >
          <CloseButton
            onClick={() => toggleDialogVisibility()}
          />
          <ChatHistory humanMessage={humanMessage} setHumanMessage={setHumanMessage} scrollRef={scrollRef} isInitVisible={isInitVisible} setIsInitVisible={setIsInitVisible} />
          <PromptForm
            humanMessage={humanMessage}
            setHumanMessage={setHumanMessage}
            // setCallbackFuncs={setCallbackFuncs}
            aiAnswerRef={aiAnswerRef}
            finishAiAnswerRef={finishAiAnswerRef}
            scrollRef={scrollRef}
            isInitVisible={isInitVisible}
            setIsInitVisible={setIsInitVisible}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AppGenerationDialog;
