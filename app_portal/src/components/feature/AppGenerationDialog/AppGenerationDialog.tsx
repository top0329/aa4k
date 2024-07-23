// src/components/feature/AppGenerationDialog/AppGenerationDialog.tsx

import { Box } from "@radix-ui/themes";
import { useAppGenerationDialogLogic } from "./useAppGenerationDialogLogic";
import CloseButton from "~/components/ui/CloseButton/CloseButton";
import { AiLoad } from "~/components/ui/AiLoad/AiLoad";
import ChatHistory from "../ChatHistory/ChatHistory";
import PromptForm from "../PromptForm/PromptForm";
import { sAppGenerationDialog, sOuterFrame, sMiddleFrame } from "./AppGenerationDialog.css";

type AppGenerationDialogProps = {
  humanMessage: string;
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  // setCallbackFuncs: React.Dispatch<React.SetStateAction<Function[] | undefined>>;
  aiAnswer: string,
  setAiAnswer: React.Dispatch<React.SetStateAction<string>>,
  finishAiAnswer: boolean,
  setFinishAiAnswer: React.Dispatch<React.SetStateAction<boolean>>,
}

const AppGenerationDialog: React.FC<AppGenerationDialogProps> = ({ humanMessage, setHumanMessage, aiAnswer, setAiAnswer, finishAiAnswer, setFinishAiAnswer }) => {

  // AppGenerationDialogコンポーネントのロジックを管理するカスタムフック
  const {
    scrollRef,
    toggleDialogVisibility,
    isInitVisible,
    setIsInitVisible,
    isLoadingVisible,
    createKintoneApp,
  } = useAppGenerationDialogLogic({ setHumanMessage, setAiAnswer, setFinishAiAnswer });

  return (
    <Box className={sOuterFrame}>
      <Box className={sMiddleFrame}>
        <Box className={sAppGenerationDialog} >
          <CloseButton
            onClick={() => toggleDialogVisibility()}
          />
          {isLoadingVisible && (<AiLoad />)}
          <ChatHistory
            humanMessage={humanMessage}
            setHumanMessage={setHumanMessage}
            scrollRef={scrollRef}
            isInitVisible={isInitVisible}
            setIsInitVisible={setIsInitVisible}
            createKintoneApp={createKintoneApp}
            isLoadingVisible={isLoadingVisible}
          />
          {!isLoadingVisible && (
            <PromptForm
              humanMessage={humanMessage}
              setHumanMessage={setHumanMessage}
              scrollRef={scrollRef}
              isInitVisible={isInitVisible}
              setIsInitVisible={setIsInitVisible}
              aiAnswer={aiAnswer}
              setAiAnswer={setAiAnswer}
              finishAiAnswer={finishAiAnswer}
              setFinishAiAnswer={setFinishAiAnswer}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AppGenerationDialog;
