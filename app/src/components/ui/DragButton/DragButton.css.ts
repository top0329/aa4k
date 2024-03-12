import { style } from "@vanilla-extract/css";
import { fabGradient } from "~/styles/animationKeyframe.css";
import { vars } from "~/styles/theme.css";

export const sDragButton = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 52,
  height: 52,
  background: vars.color.primarySolidBg,
  borderRadius: 100,
  position: "fixed",
  cursor: "pointer",
  zIndex: 1,
  transition: `transform 0.3s cubic-bezier(0.075, 0.82, 0.165, 1)`,
  ":hover": {
    background: vars.color.primarySolidHover,
  },
  ":focus": {
    outline: "none",
  },
});

export const sDragBg = style({
  position: "absolute",
  width: 60,
  height: 60,
  zIndex: 0,
  top: 0,
  background: vars.color.primarySolidBg,
  filter: "blur(16px)",
  opacity: 0.6,
});

export const animatedBG = style({
  animation: `${fabGradient} 3s infinite linear`,
});
