// src/components/ui/ChatContent_CopyOnly/ChatContent.tsx

/**
 * 【特徴】
 * ・コピー表示のみ
 */

import { Box, Flex, Separator } from "@radix-ui/themes";
import React from 'react';
import { vars } from "~/styles/theme.css";
import { ChatContentProps } from "~/types/chatContentTypes";
import { createClipboardContent } from "~/util/clipboardContent";
import Copy from '~/components/ui/Origin/Copy/Copy';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { faMessage } from '@fortawesome/pro-duotone-svg-icons';

export const ChatContent: React.FC<ChatContentProps> = ({ aiMessage, humanMessage }) => {
  const { copySuccess, copyToClipboard } = useCopyToClipboard();
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
        <Flex aria-label="Formatting options" style={{ alignItems: 'center', gap: 16 }}>
          <Copy
            isCopied={copySuccess['humanMessage'] || false}
            onCopy={() => copyToClipboard(humanMessage || '', 'humanMessage')}
            toopTip={copySuccess['humanMessage'] ? 'コピーしました' : '発話をコピー'}
            icon={faMessage}
          />
          <Copy
            isCopied={copySuccess['content'] || false}
            onCopy={() => copyToClipboard(createClipboardContent(aiMessage), 'content')}
            toopTip={copySuccess['content'] ? 'コピーしました' : '回答をコピー'}
          />
        </Flex>
      </Box>
    </>
  )
};
