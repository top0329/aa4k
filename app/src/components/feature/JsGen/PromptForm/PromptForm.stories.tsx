// src/components/feature/JsGen/PromptForm/PromptForm.stories.tsx
import { Meta } from '@storybook/react';
import { useRef, useState } from 'react';
import PromptForm from './PromptForm';

export default {
  title: 'Feature/PromptForm',
  component: PromptForm,
} as Meta;

export const Default = () => {
  const [humanMessage, setHumanMessage] = useState("");
  const [, setCallbackFuncs] = useState<Function[] | undefined>([]);
  const aiAnswerRef = useRef<string>('');
  const finishAiAnswerRef = useRef<boolean>(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <PromptForm
      isLoading={false}
      humanMessage={humanMessage}
      setHumanMessage={setHumanMessage}
      setCallbackFuncs={setCallbackFuncs}
      aiAnswerRef={aiAnswerRef}
      finishAiAnswerRef={finishAiAnswerRef}
      scrollRef={scrollRef}
    />
  )
};
