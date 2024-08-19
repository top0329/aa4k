// src\components\ui\AiResponseEffect\AiResponseEffect.css.ts
import { keyframes, style } from '@vanilla-extract/css';

export const sAiResponseEffect = style({
  height: 'auto',
  width: '6.1%',
});

export const sBlueCircle = style({
  position: 'relative',
  width: '24px',
  height: '24px',
  backgroundColor: '#5459FF',
  borderRadius: '50%',
});

// 内側の枠のアニメーションの定義
const innerCircleAnimation = keyframes({
  '0%, 25%': {
    border: '2px solid rgba(84, 89, 255, 0)',
  },
  '50%, 75%': {
    border: '2px solid rgba(84, 89, 255, 0.5)',
  },
  '100%': {
    border: '2px solid rgba(84, 89, 255, 0)',
  },
});

// 外側の枠のアニメーションの定義
const outerCircleAnimation = keyframes({
  '0%, 50%': {
    border: '2px solid rgba(84, 89, 255, 0)',
  },
  '75%': {
    border: '2px solid rgba(84, 89, 255, 0.3)',
  },
  '100%': {
    border: '2px solid rgba(84, 89, 255, 0)',
  },
});

// 内側の枠のアニメーションを適用するスタイル
export const sInnerCircleAnimated = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '32px',
  height: '32px',
  marginTop: '-16px',
  marginLeft: '-16px',
  borderRadius: '50%',
  animation: `${innerCircleAnimation} 0.75s infinite ease-in-out`,
});

// 外側の枠のアニメーションを適用するスタイル
export const sOuterCircleAnimated = style({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '40px',
  height: '40px',
  marginTop: '-20px',
  marginLeft: '-20px',
  borderRadius: '50%',
  animation: `${outerCircleAnimation} 0.75s infinite ease-in-out`,
  animationDelay: '0.05s',
});
