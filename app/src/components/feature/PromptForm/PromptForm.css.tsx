import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const sVoiceInput = style({
  boxSizing: "border-box",
  width: 32,
  height: 32,
  opacity: 0.5,
  borderRadius: `50%`,
  transition: "opacity 0.2s",
  cursor: "pointer",
  ":hover": {
    opacity: 1,
  },
});

export const boxShadowAnimation = keyframes({
  "0%": {
    boxShadow: `0px 0px 2px 4px ${vars.color.crimsonA.crimsonA1}`,
  },
  "100%": {
    boxShadow: `0px 0px 4px 4px ${vars.color.crimsonA.crimsonA6}`,
  },
});

export const sVoiceInputActive = style({
  boxSizing: "border-box",
  width: 32,
  height: 32,
  opacity: 1,
  borderRadius: `50%`,
  transition: "opacity 0.2s",
  cursor: "pointer",
  animation: `${boxShadowAnimation} 2s infinite alternate`,
  ":hover": {
    opacity: 1,
  },
});

