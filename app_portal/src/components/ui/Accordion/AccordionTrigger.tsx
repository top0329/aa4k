// src/components/ui/Accordion/AccordionTrigger.tsx

import * as Accordion from '@radix-ui/react-accordion';
import chevronDownIcon from "~/assets/chevronDownIcon.svg";
import { Box } from '@radix-ui/themes';
import clsx from 'clsx';
import { forwardRef } from "react";
import LineClamp from '../LineClamp/LineClamp';
import { sAccordionChevronDownIcon, sAccordionHeader, sAccordionTriggerMessage, sAccordionTrigger } from './AccordionTrigger.css';
import { Field } from '~/types';

type AccordionTriggerProps = Accordion.AccordionTriggerProps & {
  text: Field;
  className?: string;
  isOpen?: boolean;
  hasContent?: boolean;
};

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ text, className, isOpen, hasContent, ...props }, forwardedRef) => {
    return (
      <Accordion.Header className={sAccordionHeader}>
        <Box
          className={sAccordionTriggerMessage}
        >
          <LineClamp
            lines={1}
            isOpen={isOpen}
            text={text}
          />
        </Box>
        {hasContent && (
          <Accordion.Trigger
            className={clsx(sAccordionTrigger, className)}
            {...props}
            ref={forwardedRef}
          >
            <img
              src={chevronDownIcon}
              alt="icon"
              className={sAccordionChevronDownIcon}
              draggable="false" // cursor：pointerは生かし、ドラッグによる画像データのコピーを防止
            />
          </Accordion.Trigger>
        )}
      </Accordion.Header >
    );
  }
);

export default AccordionTrigger;
