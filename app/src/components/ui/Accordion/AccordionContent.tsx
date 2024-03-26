// src/components/ui/Accordion/AccordionContent.tsx
import * as Accordion from '@radix-ui/react-accordion';
import { Box, Text } from '@radix-ui/themes';
import clsx from 'clsx';
import { ReactNode, forwardRef } from "react";

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
        p={'3'}
        pb={'6'}
      >
        <Text size={'2'} color='gray'>{children}</Text>
      </Box>
    </Accordion.Content>
  )
);

export default AccordionContent;
