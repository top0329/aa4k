import { keyframes, style } from '@vanilla-extract/css';

const wave = keyframes({
  '50%, 75%': {
    transform: 'scale(2.5)',
  },
  '80%, 100%': {
    opacity: 0,
  },
});

const colors = ['#5459ff', '#6c70ff', '#8487ff', '#9c9fff', '#dddeff'];

export const sAiLoad = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  pointerEvents: 'none', // クリックイベントを透過させる
});

export const sDot = colors.map((color, index) =>
  style({
    position: 'relative',
    width: '2em',
    height: '2em',
    margin: '0.8em',
    borderRadius: '50%',
    background: color,
    float: 'left',
    '::before': {
      position: 'absolute',
      content: '""',
      width: '100%',
      height: '100%',
      background: 'inherit',
      borderRadius: 'inherit',
      animation: `${wave} 1.493s ease-out infinite`,
      animationDelay: `${1 + index * 0.2}s`,
    },
  })
);

export const sProcessingStateText = style({
  opacity: 0.5,
  fontSize: '15px',
})

export const sProcessingStateTextEllipses = style({
  position: 'relative',
  top:`20%`,
});
