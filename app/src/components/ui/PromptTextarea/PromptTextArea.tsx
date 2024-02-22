// src/components/ui/PromptTextarea/PromptTextArea.tsx
import { TextArea } from '@radix-ui/themes';
import React from 'react';
import { StyledItem } from './PromptTextArea.css';

type PromptTextAreaProps = {
  name: string;
  label: string;
  required?: boolean;
  value: string;
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const PromptTextArea: React.FC<PromptTextAreaProps> = ({ name, label, required, value, disabled, onChange, onKeyDown, ...rest }) => {
  return (
    <TextArea
      className={StyledItem}
      size={'3'}
      id={name}
      name={name}
      required={required}
      value={value}
      disabled={disabled}
      onChange={onChange}
      onKeyDown={onKeyDown}
      {...rest}
    />
  );
};
