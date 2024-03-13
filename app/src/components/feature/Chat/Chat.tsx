// src/components/feature/Chat/Chat.tsx
import { Box } from "@radix-ui/themes";
import clsx from "clsx";
import ScrollToBottom from "react-scroll-to-bottom";
import AccordionHistory from "../AccordionHistory/AccordionHistory";
import PromptForm from "../PromptForm/PromptForm";
import { sChat, sChatInner } from './Chat.css';

type ChatProps = {
  isLoading: boolean;
  startLoading?: () => void;
  stopLoading?: () => void;
  isChangeCodeRef: React.MutableRefObject<boolean>;
}

const Chat: React.FC<ChatProps> = ({isLoading, startLoading, stopLoading, isChangeCodeRef}) => {
  return (
    <Box className={sChat} >
      <ScrollToBottom
        className={clsx(sChatInner, 'w-100')}
        scrollViewClassName="scrollbar"
      >
        <Box
          style={{
            background: 'white',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-end',
          }}>
          <AccordionHistory isLoading={isLoading} />
        </Box>
      </ScrollToBottom>
      <PromptForm isLoading={isLoading} startLoading={startLoading} stopLoading={stopLoading} isChangeCodeRef={isChangeCodeRef} />
    </Box>
  );
};

export default Chat;
