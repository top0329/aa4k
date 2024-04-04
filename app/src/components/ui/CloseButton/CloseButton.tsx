// src/components/ui/CloseButton/CloseButton.tsx
import { faClose } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box } from '@radix-ui/themes';
import React from 'react';

type CloseButtonProps = {
  onClick: () => void;
  top?: number;
  right?: number;
};

const CloseButton: React.FC<CloseButtonProps> = ({ onClick,
  top = -4,
  right = -4
}) => {
  return (
    <Box
      style={{
        width: 20,
        height: 20,
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        top: top,
        right: right,
        cursor: 'pointer',
        padding: 8,
        zIndex: 1000,
        background: 'white',
        borderRadius: '50%',
        boxShadow: '0px 0px 16px 0px rgba(0, 0, 0, 0.22)',
      }}
      onClick={onClick}
    >
      <FontAwesomeIcon icon={faClose} size="xs" />
    </Box>
  );
};

export default CloseButton;
