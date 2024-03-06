// src/components/ui/Loading/BarLoading/BarLoading.css.ts
import { keyframes, style } from "@vanilla-extract/css";

const gradientShift = keyframes({
  "0%": {
    backgroundPosition: "0% 50%",
  },
  "50%": {
    backgroundPosition: "100% 50%",
  },
  "100%": {
    backgroundPosition: "0% 50%",
  },
});

export const sBarContainer = style({
  width: "100%",
  height: "8px",
  backgroundColor: "#e0e0e0",
  overflow: "hidden",
});

export const sBar = style({
  width: "100%",
  height: "100%",
  background: "linear-gradient(270deg, #2E3192, #5A55DA, #F63D68)",
  backgroundSize: "200% 200%",
  animation: `${gradientShift} 2s ease-in-out infinite`, // アニメーションの速度を調整
});
