// src/components/ui/Accordion/AccordionTrigger.css.ts
import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const sAccordionHeader = style({
  display: "flex",
  alignItems: "center",
  gap: 16,
  margin: "4px 0",
  padding: "0 16px",
  width: "100%",
});

export const sAccordionChevron = style({
  width: 32,
  height: 32,
  color: vars.color.grayDark.gray8,
  transition: "transform 300ms cubic-bezier(0.87, 0, 0.13, 1)",
  selectors: {
    '[data-state="open"] &': {
      transform: "rotate(-180deg)",
    },
    '[data-state="closed"] &': {
      transform: "rotate(0deg)",
    },
  },
});

export const sAccordionTrigger = style({
  marginBottom: 16,
  width: "100%",
  minHeight: 45,
  flex: 1,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  border: "none",
});

export const sAccordionTriggerInner = style({
  padding: 20,
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: vars.color.grayDark.gray4,
  backgroundColor: vars.color.grayA.grayA2,
  borderRadius: `2px 16px 16px 16px`,
  ":hover": {
    backgroundColor: vars.color.mauve.mauve2,
  },
});

export const sAccordionTriggerText = style({
  color: vars.color.grayDark.gray8,
  fontWeight: 600,
});
