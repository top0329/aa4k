// src\components\feature\AppGenerationDialog\AppGenerationDialog.css.ts
import { style } from "@vanilla-extract/css";

export const sOuterFrame = style({
  width: '50.9%',
  height: '71.95%',
  flexShrink: 0,
  borderRadius: '28px',
  border: '2px solid rgba(255, 255, 255, 0.20)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const sMiddleFrame = style({
  width: '99.3%',
  height: '98.9%',
  flexShrink: 0,
  borderRadius: '26px',
  border: '3px solid rgba(255, 255, 255, 0.50)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const sAppGenerationDialog = style({
  background: 'linear-gradient(180deg, rgb(230, 230, 255) 0%, rgb(241.6, 241.6, 252.1) 20%, rgb(250, 250, 250) 50%, rgb(242, 242, 252) 90%, rgb(229.59, 230.27, 255) 100%)',
  border: '4px solid',
  borderColor: '#ffffff',
  borderRadius: '22px',
  height: '99.1%',
  overflow: 'hidden',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '99.4%',
  display: 'flex',
  flexDirection: 'column',
  zIndex: 100,
});
