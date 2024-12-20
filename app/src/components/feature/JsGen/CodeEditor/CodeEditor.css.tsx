// src/components/feature/JsGen/CodeEditor/CodeEditor.css.tsx
import { style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const sCodeEditor = style({
  background: vars.color.gray.gray1,
  borderRadius: 16,
  position: `fixed`,
  bottom: `64px`,
  right: 660,
  display: `flex`,
  width: `calc(100vw - 680px)`,
  zIndex: 201,
  ":focus": {
    outline: `none`,
  },
  "@media": {
    "screen and (max-width: 1280px) and (max-height: 800px)": {
      left: 0,
      width: `680px`,
      maxHeight: `calc(90vh - 20px)`,
    },
  },
});

export const sCodeEditorFullScreen = style({
  position: `fixed`,
  top: 'calc(50% - 30px)',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: `99.5vw`,
  height: `calc(98vh - 60px)`,
  zIndex: 201,
  background: vars.color.gray.gray1,
  borderRadius: 0,
  display: `flex`,
  flexDirection: `column`,
  ":focus": {
    outline: `none`,
  },
});
