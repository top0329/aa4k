import { style } from "@vanilla-extract/css";
import { blinking, fadeIn, fadeOut } from "./animationKeyframe.css";

export const AnimateFadeIn = style({
  animation: `${fadeIn} 1800ms cubic-bezier(0.075, 0.82, 0.165, 1)`,
  animationFillMode: "forwards",
});

export const AnimateFadeOut = style({
  animation: `${fadeOut} 1800ms cubic-bezier(0.075, 0.82, 0.165, 1)`,
  animationFillMode: "forwards",
});

export const AnimatedHidden = style({
  display: "none",
});

export const AnimatedBlinking = style({
  animation: `${blinking} 800ms ease-in-out infinite`,
});
