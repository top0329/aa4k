// src/components/feature/Chat/Chat.tsx
import { Box } from "@radix-ui/themes";
import ScrollToBottom from "react-scroll-to-bottom";
import AccordionHistory from "../AccordionHistory/AccordionHistory";
import PromptForm from "../PromptForm/PromptForm";
import { sChat } from './Chat.css';

const Chat = () => {
  return (
    <Box className={sChat} >
      <ScrollToBottom
        className="w-100"
        scrollViewClassName="scrollbar">
        <Box style={{
          background: 'white'
        }}>
          <AccordionHistory />
        </Box>
        <PromptForm />
      </ScrollToBottom>
    </Box>
  );
};

export default Chat;
