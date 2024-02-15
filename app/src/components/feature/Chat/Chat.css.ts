import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const sChat = style({
  background: `rgba(255, 255, 255, 0.96)`,
  boxShadow: `0px 0px 32px 0 ${vars.color.grayA.grayA5}`,
  borderRadius: 16,
  position: `fixed`,
  bottom: `64px`,
  right: 8,
  display: `flex`,
  justifyContent: "flex-end",
  alignItems: "flex-end",
  width: 640,
  height: `90vh`,
  overflowY: `auto`,
  msOverflowY: `auto`,
  zIndex: 101,
  ":focus": {
    outline: `none`,
  },
});
