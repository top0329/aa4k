// src/components/ui/Accordion/AccordionContent.tsx
import * as Accordion from '@radix-ui/react-accordion';
import clsx from 'clsx';
import { ReactNode, forwardRef } from "react";
import { sAccordionContent, sAccordionContentText } from './AccordionContent.css';

type AccordionContentProps = Accordion.AccordionContentProps & {
  children: ReactNode;
  className?: string;
};

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={clsx(sAccordionContent, className)}
      {...props}
      ref={forwardedRef}
    >
      <div className={sAccordionContentText}>{children}</div>
    </Accordion.Content>
  )
);

export default AccordionContent;
