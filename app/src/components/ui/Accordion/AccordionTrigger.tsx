// src/components/ui/Accordion/AccordionTrigger.tsx
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Box, Text } from '@radix-ui/themes';
import clsx from 'clsx';
import { forwardRef } from "react";
import { vars } from '~/styles/theme.css';
import LineClamp from '../ClampedText/LineClamp';
import { sAccordionChevron, sAccordionHeader, sAccordionTrigger, sAccordionTriggerInner, sAccordionTriggerText } from './AccordionTrigger.css';

type AccordionTriggerProps = Accordion.AccordionTriggerProps & {
  text: string
  className?: string;
  isOpen?: boolean;
};

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ text, className, isOpen, ...props }, forwardedRef) => {
    return (
      <Accordion.Header className={sAccordionHeader}>
        <Accordion.Trigger
          className={clsx(sAccordionTrigger, className)}
          {...props}
          ref={forwardedRef}
        >
          <Box
            className={sAccordionTriggerInner}
          >{isOpen ?
            <Text
              size={'2'}
              className={sAccordionTriggerText}
            >
              {text}
            </Text>
            : <LineClamp
              lines={2}
              size={'1'}
              className={sAccordionTriggerText}
              style={{
                color: vars.color.grayDark.gray8,
                fontWeight: 400,
              }}
              text={text}
            />
            }
          </Box>
          <ChevronDownIcon className={sAccordionChevron} />
        </Accordion.Trigger>
      </Accordion.Header>
    );
  }
);

export default AccordionTrigger;
