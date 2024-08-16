// src/components/ui/Loading/RippleLoading/RippleLoading.css.tsx
import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '~/styles/theme.css';

const sRipple = keyframes({
  '0%': {
    transform: 'scale(0)',
    opacity: 1,
  },
  '100%': {
    transform: 'scale(1)',
    opacity: 0,
  }
});

export const sRippleContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  width: '64px',
  height: '64px',
});

export const sRippleCircle = style({
  position: 'absolute',
  width: '100%',
  height: '100%',
  border: `6px solid ${vars.color.indigo.indigo10}`,
  opacity: 1,
  borderRadius: '50%',
  animation: `${sRipple} 1.6s cubic-bezier(0, 0.2, 0.8, 1) infinite`,
  selectors: {
    '&:nth-child(2)': {
      animationDelay: '-0.5s',
    },
  },
});
