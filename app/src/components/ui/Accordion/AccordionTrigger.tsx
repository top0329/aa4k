// src/components/ui/Accordion/AccordionTrigger.tsx
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Box, Text, Tooltip } from '@radix-ui/themes';
import clsx from 'clsx';
import { forwardRef, useEffect, useState } from "react";
import { vars } from '~/styles/theme.css';
import LineClamp from '../LineClamp/LineClamp';
import { sAccordionChevron, sAccordionHeader, sAccordionTrigger, sAccordionTriggerInner, sAccordionTriggerText } from './AccordionTrigger.css';

type AccordionTriggerProps = Accordion.AccordionTriggerProps & {
  text: string
  className?: string;
  isOpen?: boolean;
};

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ text, className, isOpen, ...props }, forwardedRef) => {
    // Tooltipの表示状態を管理するための状態
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // isOpenの変更を監視し、Tooltipの状態を更新
    // 初回レンダリング時にTooltipを非表示にする
    useEffect(() => {
      if (isOpen) {
        setTooltipOpen(false);
      }
      setIsMounted(true);
    }, [isOpen]);

    return (
      <Accordion.Header className={sAccordionHeader}>
        <Accordion.Trigger
          className={clsx(sAccordionTrigger, className)}
          {...props}
          ref={forwardedRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Box
            className={sAccordionTriggerInner}
          >{isOpen ?
            <Text
              size={'3'}
              className={sAccordionTriggerText}
            >
              {text}
            </Text>
            : <LineClamp
              lines={1}
              size={'2'}
              className={sAccordionTriggerText}
              style={{
                color: vars.color.grayDark.gray8,
                fontWeight: 400,
              }}
              text={text}
            />
            }
          </Box>
          <Tooltip content={isOpen ? '閉じる' : '開く'}
            delayDuration={0}
            open={isHovered || tooltipOpen || !isMounted}
            side={'right'}
            style={{
              zIndex: 10000,
            }}
          >
            <ChevronDownIcon className={sAccordionChevron} />
          </Tooltip>
        </Accordion.Trigger>
      </Accordion.Header>
    );
  }
);

export default AccordionTrigger;
