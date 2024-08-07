// src/components/ui/PromptTextarea/PromptTextArea.tsx

import { Box, TextArea } from '@radix-ui/themes';
import React from 'react';
import './PromptTextArea.css';
import { sPromptTextArea, sPromptTextAreaContainer } from './PromptTextArea.css.ts';

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

  return (
    <Box className={sPromptTextAreaContainer}>
      <TextArea
        className={sPromptTextArea}
        size={'3'}
        id={name}
        name={name}
        required={required}
        value={value}
        disabled={disabled}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="メッセージを入力してください…"
        style={{borderRadius:'16px'}}
        {...rest}
      />
    </Box>
  );
};
