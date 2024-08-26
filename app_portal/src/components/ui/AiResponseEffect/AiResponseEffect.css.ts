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
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0 },
});

// 外側の枠のアニメーションの定義
const outerCircleAnimation = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0 },
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
  border: '2px solid rgba(84, 89, 255, 0.5)',
  opacity:0,
  borderRadius: '50%',
  animation: `${innerCircleAnimation} 1.5s infinite ease-in-out`,
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
  border: '2px solid rgba(84, 89, 255, 0.3)',
  opacity:0,
  borderRadius: '50%',
  animation: `${outerCircleAnimation} 1.5s infinite ease-in-out`,
  animationDelay: '0.2s',
});
