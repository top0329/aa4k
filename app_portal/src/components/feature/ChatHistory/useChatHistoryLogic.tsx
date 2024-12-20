// src/components/feature/ChatHistory/useChatHistoryLogic.tsx

import { useAnimation } from 'framer-motion';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { ActionTypeState } from '~/state/actionTypeState';
import { ChatHistoryState } from "~/state/chatHistoryState";

export const useChatHistoryLogic = (isInitVisible: boolean) => {
  const [chatHistoryItems] = useAtom(ChatHistoryState);
  const [actionType] = useAtom(ActionTypeState);
  const controls = useAnimation();

  const animateText = "Associate AI Hub はあなたの要望に\n最適化したkintoneアプリを作成します";

  useEffect(() => {
    const letters = animateText.split("");

    const animateLetters = async () => {
      while (true) {
        await controls.start((i) => ({
          opacity: 1,
          transition: { delay: i * 0.05, duration: 0.05 },
        }));

        await new Promise((resolve) => setTimeout(resolve, 3000));

        await controls.start((i) => ({
          opacity: 0,
          transition: { delay: (letters.length - i) * 0.05, duration: 0.05 },
        }));
      }
    };

    const timeout = setTimeout(() => {
      animateLetters();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isInitVisible]);

  return {
    actionType,
    chatHistoryItems,
    animateText,
    controls,
  }
}
