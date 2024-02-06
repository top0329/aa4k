// src/components/ui/Copy/Copy.tsx
import { faCheck, faClipboard } from '@fortawesome/pro-duotone-svg-icons';
import React from 'react';
import IconTooltipButton from '../IconTooltipButton/IconTooltipButton';


type CopyProps = {
  isCopied: boolean;
  onCopy: () => void;
};

const Copy: React.FC<CopyProps> = ({ isCopied, onCopy }) => {
  return (
    <IconTooltipButton
      icon={isCopied ? faCheck : faClipboard}
      tooltip={isCopied ? 'Copied!' : 'Copy'}
      onClick={onCopy}
      style={{
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 8,
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer'
      }}
    />

  );
};

export default Copy;
