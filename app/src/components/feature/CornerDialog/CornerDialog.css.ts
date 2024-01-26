import { style } from "@vanilla-extract/css";
import { fadeIn, fadeOut } from "~/styles/animationKeyframe.css";
import { vars } from "~/styles/theme.css";

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

export const DialogContent = style({
  background: `rgba(255, 255, 255, 0.96)`,
  boxShadow: `0px 0px 32px 0 ${vars.color.grayA.grayA5}`,
  borderRadius: 16,
  position: `fixed`,
  bottom: `64px`,
  right: `12px`,
  display: `flex`,
  width: 640,
  height: `90vh`,
  overflowY: `auto`,
  msOverflowY: `auto`,
  zIndex: 101,
  ":focus": {
    outline: `none`,
  },
});

export const JustifyFlexEnd = style({
  display: "flex",
  justifyContent: "flex-end",
});

export const Sticky = style({
  position: "sticky",
  bottom: 0,
  zIndex: 102,
});

export const Textarea = style({
  width: "100%",
  borderRadius: 8,
  background: `rgba(255, 255, 255, 0.96)`,
  padding: `12px 14px`,
  border: "none",
  resize: "none",
  boxShadow: ` 0px 0px 32px 0px rgba(0, 0, 0, 0.1)`,
});

export const TextareaContainer = style({
  position: "relative",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 12,
});
