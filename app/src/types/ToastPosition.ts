// src/types/ToastPosition.ts

export const ToastPosition = {
  TopLeft: "top-left",
  TopCenter: "top-center",
  TopRight: "top-right",
  BottomRight: "bottom-right",
  BottomCenter: "bottom-center",
  BottomLeft: "bottom-left",
} as const;
export type ToastPosition =
  (typeof ToastPosition)[keyof typeof ToastPosition];
