// taskbarのスタイルを定義する
// ----------------------------------------------------------------------
import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const DockGroup = style({
  position: "fixed",
  bottom: 0,
  left: 0,
  width: "100%",
  height: 48,
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "center",
  padding: "0 16px",
  backdropFilter: "blur(24px)",
  boxShadow: "0px 0px 32px 0px rgba(0, 0, 0, 0.12)",
  zIndex: 100,
});

export const DockInner = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 16,
});

export const DockItem = style({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  width: 36,
  height: 36,
  cursor: "pointer",
});

export const DockIconActive = style({
  background: vars.color.indigo.indigo9,
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
});

export const DockIcon = style({
  color: vars.color.gray.gray8,
});
