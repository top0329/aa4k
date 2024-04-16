// src/components/ui/ChatContent/ChatContent.tsx
import { Box, Flex } from "@radix-ui/themes";
import React from 'react';
import Feedback from '~/components/feature/Feedback/Feedback';
import { ChatContentProps } from "~/types/chatContentTypes";
import { createClipboardContent } from "~/util/clipboardContent";

export const ChatContent: React.FC<ChatContentProps> = ({ aiMessage, chatHistoryItem, humanMessage }) => {
  return (
    <>
      <Flex
        direction={'column'}
        gap={'2'}
      >
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
      </Flex>
      <Box
        mt={'5'}
        width={'100%'}
      >
        <Feedback humanMessage={humanMessage || ''} content={createClipboardContent(aiMessage)} chatHistoryItem={chatHistoryItem} />
      </Box>
    </>
  )
};
