// src/components/ui/CloseButton/CloseButton.tsx

import crossButtonIcon from "~/assets/crossButtonIcon.svg";
import { sCloseButtonIcon, sCloseButton } from './CloseButton.css';
import { Box } from '@radix-ui/themes';
import React from 'react';

type CloseButtonProps = {
  onClick: () => void;
  top?: number;
  right?: number;
  zIndex?: number;
};

const CloseButton: React.FC<CloseButtonProps> = ({ onClick,
  top = 8,
  right = 8,
  zIndex = 2000
}) => {
  return (
    <Box
      className={sCloseButton}
      style={{
        top: `${top}px`,
        right: `${right}px`,
        zIndex: zIndex,
      }}
      onClick={onClick}
    >
      <img src={crossButtonIcon} alt="icon" className={sCloseButtonIcon} />
    </Box>
  );
};

export default CloseButton;
