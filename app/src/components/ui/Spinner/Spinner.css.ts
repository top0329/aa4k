// src/components/ui/Spinner/Spinner.css.ts

import { keyframes, style } from "@vanilla-extract/css";

export const spin = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

export const sSpinner = style({
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "solid 4px",
  borderColor: "#000000 #00000010 #00000010",
  position: "relative",
  animationName: spin,
  animationDuration: "1s",
  animationIterationCount: "infinite",
  animationTimingFunction: "linear",
});
