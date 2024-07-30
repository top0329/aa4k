// src/components/ui/CloseButton/CloseButton.tsx

import crossButtonIcon from "~/assets/crossButtonIcon.svg";
import { sCloseButtonIcon, sCloseButton, sCloseButtonSmall, sCloseButtonIconSmall } from './CloseButton.css';
import { Box } from '@radix-ui/themes';
import React from 'react';

type CloseButtonProps = {
  onClick: () => void;
  top?: number;
  right?: number;
  zIndex?: number;
  className?: string;
};

const CloseButton: React.FC<CloseButtonProps> = ({ onClick,
  top = 8,
  right = 8,
  zIndex = 2000,
  className
}) => {
  const buttonClass = className === 'small' ? sCloseButtonSmall : sCloseButton;
  const iconClass = className === 'small' ? sCloseButtonIconSmall : sCloseButtonIcon;

  return (
    <Box
      className={buttonClass}
      style={{
        top: `${top}px`,
        right: `${right}px`,
        zIndex: zIndex,
      }}
      onClick={onClick}
    >
      <img src={crossButtonIcon} alt="icon" className={iconClass} />
    </Box>
  );
};

export default CloseButton;
