// src/components/feature/CodeEditor/CodeEditor.tsx
import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const sCodeEditor = style({
  background: `rgba(255, 255, 255, 0.96)`,
  border: `1px solid ${vars.color.grayA.grayA4}`,
  borderRadius: 16,
  position: `fixed`,
  bottom: `64px`,
  right: 660,
  display: `flex`,
  width: `calc(100vw - 680px)`,
  overflowY: `auto`,
  msOverflowY: `auto`,
  zIndex: 101,
  ":focus": {
    outline: `none`,
  },
});

export const sCodeEditorFullScreen = style({
  position: `fixed`,
  top: 'calc(50% - 30px)',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: `90vw`,
  height: `calc(90vh - 60px)`,
  zIndex: 101,
  background: `rgba(255, 255, 255, 0.96)`,
  border: `1px solid ${vars.color.grayA.grayA4}`,
  borderRadius: 0,
  display: `flex`,
  flexDirection: `column`,
  overflowY: `auto`,
  msOverflowY: `auto`,
  ":focus": {
    outline: `none`,
  },
});
