// src/components/ui/Accordion/AccordionContent.css.ts
import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const sAccordionContent = style({
  padding: 20,
  fontSize: 14,
  overflow: "hidden",
  color: vars.color.mauve.mauve11,
});

export const sAccordionContentText = style({
  padding: "15px 20px",
});
