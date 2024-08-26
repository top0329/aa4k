// src\components\ui\AiContents\AiContents.css.ts
import { keyframes, style } from '@vanilla-extract/css';

export const sAiContents = style({
  height: `39.5vh`,
  position: 'relative',
  width: '100%',
  "@media": {
    "(max-height: 900px)": {
      height: `37vh`,
    },
    "(max-height: 850px)": {
      height: `36vh`,
    },
    "(max-height: 800px)": {
      height: `35vh`,
    },
    "(max-height: 700px)": {
      height: `34vh`,
    },
    "(max-height: 600px)": {
      height: `33vh`,
    },
  },
});

const fadeInOut = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0 },
});

export const sStandbyMessage = style({
  paddingTop:`2.8%`,
  color: '#5459FF',
  fontWeight: 500,
  animation: `${fadeInOut} 1.5s infinite ease-in-out`,
  animationDelay: '0.05s',
})
