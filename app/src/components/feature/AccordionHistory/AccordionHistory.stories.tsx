// src/components/feature/AccordionHistory/AccordionHistory.stories.ts
import { Meta } from "@storybook/react";
import { useRef } from 'react';
import AccordionHistory from "./AccordionHistory";

export default {
  component: AccordionHistory,
  title: "Feature/AccordionHistory",
} as Meta;

export const Default = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  return (
    <AccordionHistory
      setHumanMessage={() => { }}
      isLoading={false}
      scrollRef={scrollRef}
    />
  );
}
