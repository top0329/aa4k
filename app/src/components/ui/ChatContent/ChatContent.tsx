// src/components/ui/ChatContent/ChatContent.tsx
import { Box } from "@radix-ui/themes";
import React from 'react';
import Feedback from '~/components/feature/Feedback/Feedback';
import { ChatContentProps } from "~/types/chatContentTypes";
import { createClipboardContent } from "~/util/clipboardContent";

export const ChatContent: React.FC<ChatContentProps> = ({ aiMessage, chatHistoryItem }) => {

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
      <Box
        mt={'5'}
        width={'100%'}
      >
        <Feedback content={createClipboardContent(aiMessage)} chatHistoryItem={chatHistoryItem} />
      </Box>
    </>
  )
};
