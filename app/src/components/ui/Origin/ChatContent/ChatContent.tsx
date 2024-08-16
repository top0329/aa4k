// src/components/ui/ChatContent/ChatContent.tsx
import { Box, Flex, Separator } from "@radix-ui/themes";
import React from 'react';
import Feedback from '~/components/feature/JsGen/Feedback/Feedback';
import { vars } from "~/styles/theme.css";
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
          {aiMessage.role === "ai" && aiMessage.comment && (<><Separator mb="4" size={'4'} color='gray' style={{
            opacity: 0.2
          }} /><Box p={'3'} style={{ backgroundColor: vars.color.grayA.grayA1, borderRadius: 4 }}>{aiMessage.comment}</Box></>)}
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
