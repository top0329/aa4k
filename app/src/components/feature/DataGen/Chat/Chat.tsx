// src/components/feature/DataGen/Chat/Chat.tsx
import { Box } from "@radix-ui/themes";
import { useChatLogic } from '~/components/feature/DataGen/Chat/useChatLogic';
import CloseButton from "~/components/ui/Origin/CloseButton/CloseButton";
import AccordionHistory from "../AccordionHistory/AccordionHistory";
import PromptForm from "../PromptForm/PromptForm";
import { sChat } from './Chat.css';

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
    toggleItemVisibility,
  } = useChatLogic();

  return (
    <Box className={`${sChat} allow-zoom`} >
      <CloseButton
        onClick={() => toggleItemVisibility("dataGenChatVisible")}
      />
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
