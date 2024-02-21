// src/components/ui/TypewriterEffect/TypewriterEffect.tsx
import { Box } from "@radix-ui/themes";
import clsx from "clsx";
import { useAtom } from "jotai";
import React, { useEffect, useRef, useState } from 'react';
import { InTypeWriteState } from "~/components/feature/CornerDialog/CornerDialogState";
import RatingToolbar from '~/components/feature/RatingToolbar/RatingToolbar';
import { AnimatedBlinking } from "~/styles/animation.css.ts";
import { ChatContentProps } from "~/types/chatContentTypes.ts";
import { createClipboardContent } from "~/util/clipboardContent";
import { TypewriterCursor } from "./TypewriterEffect.css.ts";

export const TypewriterEffect: React.FC<ChatContentProps> = ({ aiMessage, chatHistoryItem }) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [isCursorDisplay, setIsCursorDisplay] = useState<boolean>(false);
  const indexRef = useRef<number>(0);
  const [inTypeWrite, setInTypeWrite] = useAtom(InTypeWriteState);

  useEffect(() => {
    setIsCursorDisplay(true);
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
    setIsCursorDisplay(false);
    displayAdditional();
  }, [displayedText, aiMessage.content]);

  return (
    <>
      <Box
        style={{
          whiteSpace: "pre-wrap"
        }}
      >
        {displayedText}
        {isCursorDisplay && (
          <span className={clsx(TypewriterCursor, AnimatedBlinking)}>●</span>
        )}
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
        {!inTypeWrite && (<RatingToolbar content={createClipboardContent(aiMessage)} chatHistoryItem={chatHistoryItem} />)}
      </Box>
    </>
  );
}
