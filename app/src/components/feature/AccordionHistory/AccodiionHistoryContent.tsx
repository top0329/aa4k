import { Box } from "@radix-ui/themes";
import React from 'react';
import { AiMessage, ErrorMessage } from "~/types/ai";

type ChatContentProps = {
  aiMessage: AiMessage | ErrorMessage;
}

const AccodiionHistoryContent: React.FC<ChatContentProps> = ({ aiMessage }) => {
  return (
    <>
      <Box
        style={{
          whiteSpace: "pre-wrap"
        }}
      >
        {aiMessage.content}
      </Box>
      <Box
        style={{
          whiteSpace: "pre-wrap"
        }}
      >
        {aiMessage.role === "ai" ? aiMessage.comment : ""}
      </Box>
    </>
  )
};

export default AccodiionHistoryContent;
