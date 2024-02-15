// src/components/feature/CodeActionDialog/CodeActionDialog.css.ts
import { style } from "@vanilla-extract/css";
import { fadeIn, fadeOut } from "~/styles/animationKeyframe.css";
import { vars } from "~/styles/theme.css";

export const sCodeActionDialogOverlay = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: vars.color.grayA.grayA4,
  backdropFilter: `blur(8px)`,
  position: "fixed",
  top: `0`,
  left: `0`,
  width: `100vw`,
  height: `100vh`,
  zIndex: 1000,
  selectors: {
    '&[data-state="open"]': {
      animation: `${fadeIn} 800ms cubic-bezier(0.075, 0.82, 0.165, 1)`,
    },
    '&[data-state="closed"]': {
      animation: `${fadeOut} 200ms ease-in;`,
    },
  },
});

export const sCodeActionDialog = style({
  background: `rgba(255, 255, 255, 0.96)`,
  boxShadow: `0px 0px 32px 0 ${vars.color.grayA.grayA5}`,
  borderRadius: 16,
  padding: `32px`,
  position: `fixed`,
  top: `50%`,
  left: `50%`,
  transform: `translate(-50%, -50%)`,
  display: `flex`,
  flexDirection: `column`,
  justifyContent: "center",
  minWidth: `480px`,
  maxWidth: `80vw`,
  maxHeight: `85vh`,
  overflowY: `auto`,
  msOverflowY: `auto`,
  zIndex: 1001,
  ":focus": {
    outline: `none`,
  },
});
