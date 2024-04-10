// src/components/ui/TypewriterEffect/TypewriterEffect.tsx
import { Box, Flex } from "@radix-ui/themes";
import { useAtom } from "jotai";
import React, { useEffect, useRef, useState } from 'react';
import Feedback from '~/components/feature/Feedback/Feedback';
import DonutLoading from "~/components/ui/Loading/DonutLoading/DonutLoading";
import { InTypeWriteState } from "~/state/inTypeWriteState.tsx";
import { ChatContentProps } from "~/types/chatContentTypes.ts";
import { createClipboardContent } from "~/util/clipboardContent";

export const TypewriterEffect: React.FC<ChatContentProps> = ({ aiMessage, chatHistoryItem, isLoading = false }) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const indexRef = useRef<number>(0);
  const [inTypeWrite, setInTypeWrite] = useAtom(InTypeWriteState);

  useEffect(() => {
    if (aiMessage.content.length === 0) return;
    if (indexRef.current < aiMessage.content.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + aiMessage.content[indexRef.current]);
        indexRef.current++;
      }, 60); // 60ミリ秒ごとに次の文字を表示
      return () => clearTimeout(timeout);
    }
    async function displayAdditional() {
      // タイプライター表示完了後、500ミリ秒後に補足内容表示
      await new Promise((resolve) => setTimeout(resolve, 500));
      setInTypeWrite(false);
    }
    displayAdditional();
  }, [displayedText, aiMessage.content]);

  return (
    <>
      <Flex
        align={'center'}
        justify={'center'}
        direction={'column'}
      >
        <Box
          pt={'4'}>
          <DonutLoading
            isLoading={isLoading}
          />
        </Box>
      </Flex>
      <Box
        style={{
          whiteSpace: "pre-wrap"
        }}
      >
        {displayedText}
      </Box>
      <Box
        style={{
          whiteSpace: "pre-wrap"
        }}
      >
        {!inTypeWrite && aiMessage.role === "ai" ? aiMessage.comment : ""}
      </Box>
      <Box
        mt={'5'}
        width={'100%'}
      >
        {!inTypeWrite && (
          <Feedback
            content={createClipboardContent(aiMessage)}
            chatHistoryItem={chatHistoryItem}
            humanMessage={chatHistoryItem.human.content}
          />
        )}
      </Box>
    </>
  );
}
