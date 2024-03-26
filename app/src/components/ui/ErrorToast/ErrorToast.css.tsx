// src/components/ui/ErrorToast/ErrorToast.css.tsx
import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const sToastViewport = style({
  position: 'fixed',
  display: 'flex',
  flexDirection: 'column',
  padding: 24,
  gap: 12,
  minWidth: 320,
  maxWidth: 480,
  minHeight: 88,
  margin: 0,
  listStyle: 'none',
  zIndex: 2000,
});

export const sToastPosition = {
  'top-left': style([
    sToastViewport,
    {
      left: 0,
      alignItems: 'flex-start',
    }
  ]),
  'top-center': style([
    sToastViewport,
    {
      left: '50%',
      transform: 'translateX(-50%)',
      alignItems: 'center',
    }
  ]),
  'top-right': style([
    sToastViewport,
    {
      right: 0,
      alignItems: 'flex-end',
    }
  ]),
  'bottom-right': style([
    sToastViewport,
    {
      right: 0,
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
    }
  ]),
  'bottom-center': style([
    sToastViewport,
    {
      left: '50%',
      transform: 'translateX(-50%)',
      alignItems: 'center',
      justifyContent: 'flex-end',
    }
  ]),
  'bottom-left': style([
    sToastViewport,
    {
      left: 0,
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
    }
  ]),
};

export const sProgressBar = style({
  height: 8,
  backgroundColor: vars.color.tomato.tomato10,
  borderRadius: 8,
});

export const sToast = style({
  position: 'relative',
  padding: 16,
  backgroundColor: vars.color.tomato.tomato4,
  borderRadius: 8,
  border: `1px solid ${vars.color.tomato.tomato8}`,
  color: vars.color.tomato.tomato10,
  boxShadow: `0 0 36px ${vars.color.gray.gray8}`,
});
