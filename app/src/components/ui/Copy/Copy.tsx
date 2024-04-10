// src/components/ui/Copy/Copy.tsx
import { IconDefinition, faCheck, faClipboard } from '@fortawesome/pro-duotone-svg-icons';
import React from 'react';
import IconTooltipButton from '../IconTooltipButton/IconTooltipButton';
import { sCopy } from './copy.css';


type CopyProps = {
  isCopied: boolean;
  onCopy: () => void;
  toopTip?: string;
  icon?: IconDefinition
};

const Copy: React.FC<CopyProps> = ({ isCopied, onCopy, toopTip = isCopied ? 'Copied!' : 'Copy', icon = faClipboard }) => {
  return (
    <IconTooltipButton
      icon={isCopied ? faCheck : icon}
      tooltip={toopTip}
      onClick={onCopy}
      className={sCopy}
    />

  );
};

export default Copy;
