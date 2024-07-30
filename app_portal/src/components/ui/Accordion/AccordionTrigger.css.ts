// src/components/ui/Accordion/AccordionTrigger.css.ts
import { style } from "@vanilla-extract/css";

// アコーディオントリガー全体
export const sAccordionHeader = style({
  display: "flex",
  alignItems: "center",
  margin: "8px 0",
  padding: "0 16px",
  width: "100%",
});

// メッセージ部分
export const sAccordionTriggerMessage = style({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: 'linear-gradient(to right, #eee 4px, transparent 4px)', //背景を右方向に向かう線形グラデーションに設定（2px幅でグレー色から透明に変化）
  paddingLeft: '10px',
  cursor: "auto",
});

// トリガー部分
export const sAccordionTrigger = style({
  width: "100%",
  height:'auto',
  flex: 1,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  border: "none",
  padding:0,
});

export const sAccordionChevronDownIcon = style({
  width: 14,
  height: 24,
  marginBottom:"-14px",
  cursor:'pointer',
  transition: "transform 300ms cubic-bezier(0.87, 0, 0.13, 1)",
  selectors: {
    '[data-state="open"] &': {
      transform: "rotate(-180deg)",
    },
    '[data-state="closed"] &': {
      transform: "rotate(0deg)",
    },
  },
});

export const sAccordionContent = style({
  paddingTop: 0,
  marginTop: '-8px',
  fontSize: "14px",
  fontWeight:400,
});
