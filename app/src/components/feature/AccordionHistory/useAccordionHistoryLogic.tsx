// src/components/feature/AccordionHistory/useAccordionHistoryLogic.tsx
import { useAnimation } from 'framer-motion';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useChatHistory } from '~/hooks/useChatHistory';
import { InTypeWriteState } from '~/state/inTypeWriteState';
import { LatestAiResponseIndexState } from '~/state/latestAiResponseIndexState';
import { ViewModeState } from '~/state/viewModeState';

export const useAccordionHistoryLogic = () => {
  const [isPcViewMode] = useAtom(ViewModeState);
  const { chatHistoryItems } = useChatHistory(isPcViewMode);
  const [latestAiResponseIndex] = useAtom(LatestAiResponseIndexState);
  const [inTypeWrite] = useAtom(InTypeWriteState);
  const [activeItem, setActiveItem] = useState('');
  const controls = useAnimation();

  useEffect(() => {
    if (chatHistoryItems.length > 0) {
      setActiveItem(`item-${chatHistoryItems.length - 1}`);
    }
  }, [chatHistoryItems]);

  const animateText = "生成AIがカスタムJavaScriptの\n作成をサポートします。";

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
    chatHistoryItems,
    latestAiResponseIndex,
    inTypeWrite,
    activeItem,
    setActiveItem,
    isPcViewMode
  }
}
