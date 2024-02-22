// src/components/ui/PromptTextarea/PromptTextArea.stories.tsx
import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { PromptTextArea } from './PromptTextArea';

export default {
  title: 'Forms/PromtTextArea',
  component: PromptTextArea,
} as Meta;

export const Default = () => {
  const [value, setValue] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  };

  return (
    <PromptTextArea
      name="test"
      label="Test Label"
      value={value}
      disabled={false}
      onChange={handleChange}
    />
  );
};

