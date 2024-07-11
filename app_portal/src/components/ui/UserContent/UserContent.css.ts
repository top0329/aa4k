import { style } from '@vanilla-extract/css';

export const sUserContent = style({
  height: '24px',
  position: 'relative',
  width: '818px',
  color: '#000000',
  fontSize: '18px',
  fontWeight: 500,
  left: 0,
  letterSpacing: 0,
  lineHeight: '24px',
  top: '-1px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis', // 表示限界を超えたら「…」を表示する
  maxWidth: '100%',
});
