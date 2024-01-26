// src/components/ui/Accordion/AccordionTrigger.tsx
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Box } from '@radix-ui/themes';
import clsx from 'clsx';
import React, { forwardRef } from "react";
import { sAccordionChevron, sAccordionHeader, sAccordionTrigger, sAccordionTriggerInner } from './AccordionTrigger.css';

type AccordionTriggerProps = Accordion.AccordionTriggerProps & {
  children: React.ReactNode;
  className?: string;
};

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <Accordion.Header className={sAccordionHeader}>
        <Accordion.Trigger
          className={clsx(sAccordionTrigger, className)}
          {...props}
          ref={forwardedRef}
        >
          <Box className={sAccordionTriggerInner}>
            {children}
          </Box>
          <ChevronDownIcon className={sAccordionChevron} />
        </Accordion.Trigger>
      </Accordion.Header>
    );
  }
);

export default AccordionTrigger;
