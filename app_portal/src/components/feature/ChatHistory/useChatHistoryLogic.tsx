// src/components/feature/ChatHistory/useChatHistoryLogic.tsx

import { useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export const useChatHistoryLogic = () => {
  const controls = useAnimation();

  const animateText = "アプリを自動作成します。\nどのようなアプリを作成しますか？";

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
  }, []);

  return {
    animateText,
    controls,
  }
}
