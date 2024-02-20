// src/components/ui/PromtTextarea/PromtTextArea.tsx
import { TextArea } from '@radix-ui/themes';
import React from 'react';
import { StyledItem } from './PromtTextArea.css';

type PromtTextAreaProps = {
  name: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const PromtTextArea: React.FC<PromtTextAreaProps> = ({ name, label, required, value, onChange, onKeyDown, ...rest }) => {
  return (
    <TextArea
      className={StyledItem}
      size={'3'}
      id={name}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      {...rest}
    />
  );
};
