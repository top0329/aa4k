// src\components\ui\AiContents\AiContents.css.ts
import { style } from '@vanilla-extract/css';

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
