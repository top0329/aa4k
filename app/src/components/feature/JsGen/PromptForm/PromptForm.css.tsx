// src/components/feature/JsGen/PromptForm/PromptForm.css.tsx
import { keyframes, style } from "@vanilla-extract/css";
import { vars } from "~/styles/theme.css";

export const sVoiceInput = style({
  borderRadius: `50%`,
  transition: "opacity 0.2s",
  cursor: "pointer",
  ":hover": {
    opacity: 0.8,
  },
});

export const sVoiceInputDisabled = style({
  opacity: 0.5,
  borderRadius: `50%`,
  transition: "opacity 0.2s",
  cursor: "pointer",
});

export const boxShadowAnimation = keyframes({
  "0%": {
    boxShadow: `0px 0px 2px 4px ${vars.color.crimsonA.crimsonA1}`,
  },
  "100%": {
    boxShadow: `0px 0px 4px 4px ${vars.color.crimsonA.crimsonA6}`,
  },
});

export const sVoiceInputActive = style({
  opacity: 1,
  transition: "opacity 0.2s",
  cursor: "pointer",
  animation: `${boxShadowAnimation} 2s infinite alternate`,
  ":hover": {
    opacity: 1,
  },
});

export const sPromptForm = style({
  height: '20vh',
  maxHeight: '100%',
  "@media": {
    "(max-height: 860px)": {
      height: `21vh`,
    },
    "(max-height: 800px)": {
      height: `22.6vh`,
    },
  },
});

// [新しく会話を始める]ボタンの活性時
export const sClearConversation = style({
  borderRadius: `50%`,
  transition: "opacity 0.2s",
  cursor: "pointer",
  ":hover": {
    opacity: 0.8,
  },
});

// [新しく会話を始める]ボタンの非活性時
export const sClearConversationDisabled = style({
  opacity: 0.5,
  borderRadius: `50%`,
  transition: "opacity 0.2s",
  cursor: "pointer",
});
