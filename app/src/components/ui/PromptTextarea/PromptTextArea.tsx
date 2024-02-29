// src/components/ui/PromptTextarea/PromptTextArea.tsx
import { TextArea } from '@radix-ui/themes';
import React from 'react';
import { useAutoResizeTextArea } from '~/hooks/useAutoResizeTextArea';
import { StyledItem } from './PromptTextArea.css';

type PromptTextAreaProps = {
  name: string;
  label: string;
  required?: boolean;
  value: string;
  disabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  lineHeight?: number;
  maxRows?: number;
}

export const PromptTextArea: React.FC<PromptTextAreaProps> = ({ name, label, required, value, disabled, onChange, onKeyDown, lineHeight, maxRows, ...rest }) => {
  const textAreaRef = useAutoResizeTextArea(value, maxRows, lineHeight);

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
      ref={textAreaRef}
      {...rest}
    />
  );
};
