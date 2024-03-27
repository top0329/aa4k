// src/components/feature/Chat/Chat.tsx
import { Box } from "@radix-ui/themes";
import AccordionHistory from "../AccordionHistory/AccordionHistory";
import PromptForm from "../PromptForm/PromptForm";
import { sChat } from './Chat.css';
import { useChatLogic } from '~/components/feature/Chat/useChatLogic';

type ChatProps = {
  isLoading: boolean;
  startLoading?: () => void;
  stopLoading?: () => void;
  isChangeCodeRef: React.MutableRefObject<boolean>;
  humanMessage: string;
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  setCallbackFuncs: React.Dispatch<React.SetStateAction<Function[] | undefined>>;
  aiAnswerRef: React.MutableRefObject<string>;
  finishAiAnswerRef: React.MutableRefObject<boolean>;
}

const Chat: React.FC<ChatProps> = ({ isLoading, startLoading, stopLoading, isChangeCodeRef, humanMessage, setHumanMessage, setCallbackFuncs, aiAnswerRef, finishAiAnswerRef }) => {
  const {
    scrollRef,
  } = useChatLogic();

  return (
    <Box className={sChat} >
      <AccordionHistory isLoading={isLoading} setHumanMessage={setHumanMessage} scrollRef={scrollRef} />
      <PromptForm
        isLoading={isLoading}
        startLoading={startLoading}
        stopLoading={stopLoading}
        isChangeCodeRef={isChangeCodeRef}
        humanMessage={humanMessage}
        setHumanMessage={setHumanMessage}
        setCallbackFuncs={setCallbackFuncs}
        aiAnswerRef={aiAnswerRef}
        finishAiAnswerRef={finishAiAnswerRef}
        scrollRef={scrollRef}
      />
    </Box>
  );
};

export default Chat;
