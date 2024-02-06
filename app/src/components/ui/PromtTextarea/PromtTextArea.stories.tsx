// src/components/ui/PromtTextarea/PromtTextArea.stories.tsx
import { Meta } from '@storybook/react';
import React, { useState } from 'react';
import { PromtTextArea } from './PromtTextArea';

export default {
  title: 'Forms/PromtTextArea',
  component: PromtTextArea,
} as Meta;

export const Default = () => {
  const [value, setValue] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(event.target.value);
  };

  return (
    <PromtTextArea
      name="test"
      label="Test Label"
      value={value}
      onChange={handleChange}
    />
  );
};

