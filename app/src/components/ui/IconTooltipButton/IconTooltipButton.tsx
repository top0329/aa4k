// src/components/ui/IconTooltipButton/IconTooltipButton.tsx
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Flex, Tooltip } from '@radix-ui/themes';
import React, { forwardRef } from 'react';
import { vars } from '~/styles/theme.css';

type IconTooltipButtonProps = {
  icon: IconDefinition;
  tooltip: string;
  onClick: () => void;
  pressed?: boolean;
  style?: React.CSSProperties;
  pressedColor?: string;
  defaultColor?: string;
  className?: string;
};

const IconTooltipButton = forwardRef<HTMLDivElement, IconTooltipButtonProps>(({
  icon,
  tooltip,
  onClick,
  pressed = false,
  style = {
    cursor: 'pointer',
  },
  pressedColor = vars.color.gray.gray10,
  defaultColor = vars.color.gray.gray10,
  className
}, ref) => {
  return (
    <Tooltip content={tooltip}
      style={{

        zIndex: 10000,
      }}
    >
      <Flex justify={'center'} align={'center'} ref={ref} onClick={onClick} style={style} className={className}>
        <FontAwesomeIcon icon={icon} size="lg" color={pressed ? pressedColor : defaultColor} />
      </Flex>
    </Tooltip>
  );
});

export default IconTooltipButton;
