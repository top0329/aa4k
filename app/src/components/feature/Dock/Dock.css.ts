// taskbarのスタイルを定義する
// ----------------------------------------------------------------------
import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const DockGroup = style({
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  height: 56,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 16px",
  backdropFilter: "blur(24px)",
  boxShadow: "0px 0px 32px 0px rgba(0, 0, 0, 0.12)",
  zIndex: 100,
});

export const DockAction = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 16,
});

export const DockItem = style({
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

export const DockIcon = style({
  color: vars.color.gray.gray8,
});
