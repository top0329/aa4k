import { style } from "@vanilla-extract/css";

export const sCopy = style({
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 8,
  borderRadius: 8,
  transition: "all 0.2s ease-in-out",
  cursor: "pointer",
  ":hover": {
    backgroundColor: "rgba(0,0,0,0.1)",
  },
});
