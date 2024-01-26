// src/components/feature/AccordionHistory/AccordionHistory.css.ts
import { style } from "@vanilla-extract/css";

export const sChatHistory = style({
  borderRadius: 6,
  width: "100%",
  backgroundColor: "white",
});

export const sChatHistoryItem = style({
  overflow: "hidden",
  width: "100%",
  marginTop: 1,
  cursor: "pointer",
  ":first-child": {
    marginTop: 0,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  ":last-child": {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  ":focus-within": {
    position: "relative",
    zIndex: 1,
  },
});
