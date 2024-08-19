// src\components\feature\ChatHistory\ChatHistory.css.ts
import { style } from '@vanilla-extract/css';

export const sChatHistory = style({
  height: '69.75%',
  width: '100%',
  position: 'relative',
  top: '0',
  left: '0',
  background: 'transparent',
  zIndex: 105, // AppGenerationDialog（100）よりも前面に表示
  "@media": {
    "(max-height: 900px)": {
      height: '68%',
    },
    "(max-height: 850px)": {
      height: '67%',
    },
    "(max-height: 822px)": {
      height: `66%`,
    },
  },
});

export const sChatHistorySuggest = style({
  padding: 16,
  backgroundColor: '#ffffff',
  border: '1px solid',
  borderColor: '#ebebeb',
  borderRadius: '100px',
  height: '56px',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'start',
  ":hover": {
    backgroundColor: '#f0f0f0',
  },
});

export const sChatHistorySuggestButtonIcon = style({
  pointerEvents: 'none',
  width: '9px',
  height: '17px',
});

export const sChatHistorySuggestCard = style({
  padding: 0,
  width: 'fit-content',
});
