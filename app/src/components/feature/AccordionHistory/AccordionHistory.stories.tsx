// src/components/feature/AccordionHistory/AccordionHistory.stories.ts
import { Meta } from "@storybook/react";
import { useCornerDialogLogic } from "../CornerDialog/useCornerDialogLogic";
import AccordionHistory from "./AccordionHistory";

export default {
  component: AccordionHistory,
  title: "Feature/AccordionHistory",
} as Meta;

export const Default = () => {
  const { conversations } = useCornerDialogLogic();
  return (<AccordionHistory
    conversations={conversations}
  />);
}
