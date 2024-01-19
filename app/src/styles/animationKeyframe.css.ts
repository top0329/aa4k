import { keyframes } from "@vanilla-extract/css";

export const contentShow = keyframes({
  from: {
    opacity: 0,
    transform: `translate(-50%, -50%) scale(0.8)`,
  },
  to: {
    opacity: 1,
    transform: `translate(-50%, -50%) scale(1)`,
  },
});

export const fadeIn = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
});

export const fadeOut = keyframes({
  from: {
    opacity: 1,
  },
  to: {
    opacity: 0,
  },
});

export const pulse = keyframes({
  "0%": {
    transform: `scale(1)`,
  },
  "50%": {
    transform: `scale(1.4)`,
  },
  "100%": {
    transform: `scale(1)`,
  },
});

export const blurIn = keyframes({
  from: {
    filter: `blur(2px)`,
  },
  to: {
    filter: `blur(6px)`,
  },
});

export const blinking = keyframes({
  "0%": {
    opacity: 1,
  },
  "100%": {
    opacity: 0,
  },
});

export const aiBtnGradient = keyframes({
  "0%": {
    backgroundPosition: "0% 50%",
  },
  "50%": {
    scale: 1.1,
    filter: "blur(12px)",
    backgroundPosition: "100% 50%",
  },
  "100%": {
    scale: 1,
    backgroundPosition: "0% 50%",
  },
});

export const fabGradient = keyframes({
  "0%": {
    backgroundPosition: "0% 50%",
    opacity: 0.6,
  },
  "50%": {
    opacity: 1,
    scale: 1.1,
    filter: "blur(12px)",
    backgroundPosition: "100% 50%",
  },
  "100%": {
    opacity: 0.6,
    scale: 1,
    backgroundPosition: "0% 50%",
  },
});
