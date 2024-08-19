// src\components\ui\AiMessage\AiMessage.css.ts
import { style } from '@vanilla-extract/css';

export const sAiMessage = style({
  paddingTop:'2.5%',
  height: '100%',
  position: 'relative',
  width: `39.8vw`,
  fontSize: '18px',
  color: '#5459FF',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '32px',
  "@media": {
    "(max-width: 1250px)": {
      width: `38.8vw`,
    },
    "(max-width: 1000px)": {
      width: `37.8vw`,
    },
  },
});

export const sErrorAiResponseText = style({
  color: 'red',
});

export const sErrorText = style({
  color: '#5459FF',
});
