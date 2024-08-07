import { style } from '@vanilla-extract/css';

export const sAiMessage = style({
  paddingTop:'20px',
  height: 'fit-content',
  position: 'relative',
  width: '770px',
  fontSize: '18px',
  color: '#5459FF',
  fontStyle: 'normal',
  fontWeight: 500,
  lineHeight: '32px',
});

export const sErrorAiResponseText = style({
  color: 'red',
});

export const sErrorText = style({
  color: '#5459FF',
});
