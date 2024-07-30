// src\components\feature\ShowDetailDialog\ShowDetailDialog.css.ts
import { style } from '@vanilla-extract/css';

export const sShowDetailDialog = style({
  backgroundColor: '#ffffff',
  borderRadius: '22px',
  height: '662px',
  position: 'fixed',
  width: '260px',
  top: '50%',
  left: 'calc(50% - 473px - 31px - 260px)',
  transform: 'translateY(-50%)',
  zIndex: 100,
});
