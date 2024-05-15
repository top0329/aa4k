import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const sChat = style({
  background: `rgba(255, 255, 255, 0.96)`,
  boxShadow: `0px 0px 32px 0 ${vars.color.grayA.grayA4}`,
  borderRadius: 16,
  position: `fixed`,
  bottom: `68px`,
  right: 12,
  display: `flex`,
  justifyContent: "flex-end",
  alignItems: "flex-end",
  flexDirection: "column",
  width: 640,
  maxWidth: `100vw`,
  height: `89vh`,
  maxHeight: `100vh`,
  msOverflowY: `auto`,
  zIndex: 101,
  ":focus": {
    outline: `none`,
  },
  "@media": {
    "screen and (max-width: 1440px) and (max-height: 800px)": {
      width: `46vw`,
      height: `fit-content`,
      maxHeight: `100vh`,
    },
  },
});

export const sChatInner = style({
  height: `100%`,
});
