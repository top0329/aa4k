import { style } from '@vanilla-extract/css';

export const sCreateAppButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 24px',
  backgroundColor: '#ffffff',
  border: '2px solid',
  borderColor: '#ff4848',
  borderRadius: '100px',
  gap: '4px',
  width: 'fit-content',
  position: 'relative',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.3s, color 0.3s',
  ':hover': {
    backgroundColor: '#ff4848',// ホバー時の背景色を赤に変更
    color: '#fff', // ホバー時のテキスト色を白に変更
  },
});

export const sTriangleIcon = style({
  pointerEvents: 'none',
  display: 'inline-block',
  width: 0,
  height: 0,
  borderLeft: '6px solid transparent',
  borderRight: '6px solid transparent',
  borderBottom: '8px solid #ff4848',
  marginRight: '8px',
  transform: 'rotate(90deg)', // 三角形を右向きに回転
  transition: 'border-bottom-color 0.3s',
  verticalAlign: 'middle',
});

export const sTriangleIconHover = style({
  selectors: {
    [`${sCreateAppButton}:hover &`]: {
      borderBottomColor: '#fff', // ホバー時の三角形の色を白に変更
      pointerEvents: 'none',
    },
  },
});

export const sText = style({
  pointerEvents: 'none',
  color: '#ff4848',
  transition: 'color 0.3s',
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: 0,
  lineHeight: '24px',
  marginTop: '-2px',
  position: 'relative',
  whiteSpace: 'nowrap',
  width: 'fit-content',
});

export const sTextHover = style({
  selectors: {
    [`${sCreateAppButton}:hover &`]: {
      color: '#fff', // ホバー時のテキストの色を白に変更
      pointerEvents: 'none',
    },
  },
});
