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
  height: `90vh`,
  overflowY: `auto`,
  msOverflowY: `auto`,
  zIndex: 101,
  ":focus": {
    outline: `none`,
  },
});

export const sChatInner = style({
  height: `calc(100% - 100px)`,
});
