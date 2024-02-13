import { style } from "@vanilla-extract/css";
import { fadeIn, fadeOut } from "~/styles/animationKeyframe.css";

export const DialogOverlay = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: `linear-gradient(rgba(255,255,255,0),rgba(255,255,255,1))`,
  backdropFilter: `blur(2px)`,
  position: "fixed",
  top: `70vh`,
  width: `100vw`,
  height: `30vh`,
  zIndex: 100,
  selectors: {
    '&[data-state="open"]': {
      animation: `${fadeIn} 800ms cubic-bezier(0.075, 0.82, 0.165, 1)`,
    },
    '&[data-state="closed"]': {
      animation: `${fadeOut} 200ms ease-in;`,
    },
  },
});

export const Sticky = style({
  position: "sticky",
  bottom: 0,
  zIndex: 102,
});
