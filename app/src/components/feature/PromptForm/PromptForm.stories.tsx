// src/components/feature/PromptForm/PromptForm.stories.tsx
import { Meta } from '@storybook/react';
import { useState } from 'react';
import PromptForm from './PromptForm';

export default {
  title: 'Feature/PromptForm',
  component: PromptForm,
} as Meta;

export const Default = () => {
  const [humanMessage, setHumanMessage] = useState("");

  return (
    <PromptForm isLoading={false} humanMessage={humanMessage} setHumanMessage={setHumanMessage} />
  )
};
