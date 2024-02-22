// src/components/ui/Loading/DonutLoading/DonutLoading.css.ts

import { keyframes, style } from "@vanilla-extract/css";

export const spin = keyframes({
  "0%": { transform: "rotate(0deg)" },
  "100%": { transform: "rotate(360deg)" },
});

export const sDonut = style({
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: "solid 4px",
  position: "relative",
  animationName: spin,
  animationDuration: "1s",
  animationIterationCount: "infinite",
  animationTimingFunction: "linear",
});
