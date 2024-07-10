import { style,globalStyle } from "@vanilla-extract/css";

export const sCloseButtonIcon = style({
  pointerEvents: 'none',
  width: '16px',
  height: '16px',
  transition: 'filter 0.3s ease',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
});

export const sCloseButton = style({
  width: '36px',
  height: '36px',
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  top: '8px',
  right: '8px',
  cursor: 'pointer',
  zIndex: 2000,
  background: 'white',
  borderRadius: '50%',
  transition: 'background 0.3s ease',
  overflow: 'hidden',
});

// シンプルな色の反転の為、globalStyleを使う
globalStyle(`${sCloseButton}:hover`, {
    background: 'black',
});

globalStyle(`${sCloseButton}:hover ${sCloseButtonIcon}`, {
    filter: 'invert(1)', // アイコンを白くする
});
