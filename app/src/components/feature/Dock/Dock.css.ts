// taskbarのスタイルを定義する
// ----------------------------------------------------------------------
import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const sDockGroup = style({
  padding: `0 16px`,
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  height: 56,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backdropFilter: "blur(24px)",
  boxShadow: "0px 0px 32px 0px rgba(0, 0, 0, 0.12)",
  zIndex: 100,
});

export const sDockItem = style({
  padding: 4,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: 40,
  height: 40,
  borderRadius: `100%`,
  transition: "all 0.2s",
  cursor: "pointer",
  ":hover": {
    opacity: 0.8,
    backgroundColor: vars.color.gray.gray3,
  },
});
