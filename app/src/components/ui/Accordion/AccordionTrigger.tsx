// src/components/ui/Accordion/AccordionTrigger.tsx
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Box, Text } from '@radix-ui/themes';
import clsx from 'clsx';
import { forwardRef } from "react";
import { vars } from '~/styles/theme.css';
import LineClamp from '../LineClamp/LineClamp';
import { sAccordionChevron, sAccordionHeader, sAccordionHumenMessage, sAccordionTrigger, sAccordionTriggerText } from './AccordionTrigger.css';

type AccordionTriggerProps = Accordion.AccordionTriggerProps & {
  text: string
  className?: string;
  isOpen?: boolean;
};

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ text, className, isOpen, ...props }, forwardedRef) => {

    return (
      <Accordion.Header className={sAccordionHeader}>
        <Box
          className={sAccordionHumenMessage}
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
        <Accordion.Trigger
          className={clsx(sAccordionTrigger, className)}
          {...props}
          ref={forwardedRef}
        >
          <ChevronDownIcon className={sAccordionChevron} />
        </Accordion.Trigger>
      </Accordion.Header>
    );
  }
);

export default AccordionTrigger;
