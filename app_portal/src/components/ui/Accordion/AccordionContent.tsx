// src/components/ui/Accordion/AccordionContent.tsx

import * as Accordion from '@radix-ui/react-accordion';
import { Box, Text } from '@radix-ui/themes';
import clsx from 'clsx';
import { ReactNode, forwardRef } from "react";
import { sAccordionContent } from './AccordionTrigger.css';

type AccordionContentProps = Accordion.AccordionContentProps & {
  children: ReactNode;
  className?: string;
};

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={clsx(className)}
      {...props}
      ref={forwardedRef}
    >
      <Box
        pr={'3'}
        pl={'3'}
        pb={'4'}
        className={sAccordionContent}
      >
        <Text>{children}</Text>
      </Box>
    </Accordion.Content>
  )
);

export default AccordionContent;
