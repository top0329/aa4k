// src/components/ui/ErrorToast/ErrorToast.css.tsx
import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";


export const sToastViewport = style({
  position: 'fixed',
  top: 16,
  padding: 0,
  minWidth: 320,
  maxWidth: 480,
  minHeight: 88,
  display: 'flex',
  flexDirection: 'column-reverse',
  gap: 12,
});

export const sProgressBar = style({
  height: 8,
  backgroundColor: vars.color.tomato.tomato10,
  borderRadius: 8,
});

export const sToastViewPort = style({
  position: 'fixed',
  top: 16, // 画面の下からのオフセット
  left: 16, // 画面の右からのオフセット
  display: 'flex',
  flexDirection: 'column', // トーストを上から下にスタック
  gap: 16,
  zIndex: 2000,
});

export const sToast = style({
  position: 'relative',
  padding: 16,
  backgroundColor: vars.color.tomato.tomato4,
  borderRadius: 8,
  border: `1px solid ${vars.color.tomato.tomato8}`,
  color: vars.color.tomato.tomato10,
  boxShadow: `0 0 36px ${vars.color.tomato.tomato3}`,
});
