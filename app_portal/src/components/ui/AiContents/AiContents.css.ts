// src\components\ui\AiContents\AiContents.css.ts
import { style } from '@vanilla-extract/css';

export const sAiContents = style({
  height: `39.5vh`,
  position: 'relative',
  width: '100%',
  "@media": {
    "(max-height: 900px)": {
      height: `39vh`,
    },
    "(max-height: 850px)": {
      height: `38.5vh`,
    },
    "(max-height: 800px)": {
      height: `38vh`,
    },
  },
});
