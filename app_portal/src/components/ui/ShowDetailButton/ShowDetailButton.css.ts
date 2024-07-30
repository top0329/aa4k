// src\components\ui\ShowDetailButton\ShowDetailButton.css.ts
import { style } from '@vanilla-extract/css';

export const sShowDetailButton = style({
  marginTop:'-8px',
  marginLeft:'8px',
  marginBottom:'4px',
  cursor: 'pointer',
});

export const sText = style({
  pointerEvents: 'none',
  color: '#2E3192',
  transition: 'color 0.3s',
  fontSize: '14px',
  textDecoration: 'underline',
  fontWeight: 500,
});
