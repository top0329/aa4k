// src\components\feature\ShowDetailDialog\ShowDetailDialog.css.ts
import { style } from '@vanilla-extract/css';

export const sShowDetailDialog = style({
  backgroundColor: '#ffffff',
  borderRadius: '22px',
  height: '69.5%',
  position: 'fixed',
  top: '50%',
  left: '10%',
  right: '76.35%',
  transform: 'translateY(-50%)',
  zIndex: 100,
  "@media": {
    "(max-width: 1620px)": {
      left: '8%',
    },
    "(max-width: 1420px)": {
      left: '5%',
    },
    "(max-width: 1190px)": {
      left: '3%',
    },
  },
});
