import { style } from "@vanilla-extract/css";

export const sDialogOverlay = style({
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  position: 'fixed',
  inset: 0,
});

export const Sticky = style({
  position: "sticky",
  bottom: 0,
  zIndex: 102,
});

export const sBannerButtonIcon = style({
  width: '24px',
  height: '24px',
  pointerEvents: 'none',
});
