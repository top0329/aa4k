import { createSprinkles, defineProperties } from "@vanilla-extract/sprinkles";
import { vars } from "./theme.css";

const space = vars.spacing;

const responsiveProperties = defineProperties({
  properties: {
    position: ["absolute", "relative", "fixed"],
    display: ["none", "block", "inline", "inline-block", "flex"],
    alignItems: ["flex-start", "center", "flex-end"],
    justifyContent: ["flex-start", "center", "flex-end", "space-between"],
    flexDirection: ["row", "row-reverse", "column", "column-reverse"],
    paddingTop: space,
    paddingBottom: space,
    paddingLeft: space,
    paddingRight: space,
    marginTop: space,
    marginBottom: space,
    marginLeft: space,
    marginRight: space,
    pointerEvents: ["none", "auto"],
    overflow: ["hidden"],
    opacity: [0, 1],
    textAlign: ["left", "center", "right"],
    minWidth: [0],
    maxWidth: vars.contentWidth,
    transition: {
      slow: "transform .3s ease, opacity .3s ease",
      fast: "transform .15s ease, opacity .15s ease",
    },
  },
  shorthands: {
    padding: ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight"],
    paddingX: ["paddingLeft", "paddingRight"],
    paddingY: ["paddingTop", "paddingBottom"],
    margin: ["marginTop", "marginBottom", "marginLeft", "marginRight"],
    marginX: ["marginLeft", "marginRight"],
    marginY: ["marginTop", "marginBottom"],
  },
});

const unresponsiveProperties = defineProperties({
  properties: {
    flexWrap: ["wrap", "nowrap"],
    top: [0],
    bottom: [0],
    left: [0],
    right: [0],
    flexShrink: [0],
    flexGrow: [0, 1],
    zIndex: [-1, 0, 1],
    width: { full: "100%" },
    borderRadius: vars.border.radius,
    cursor: ["pointer"],
  },
  shorthands: {
    inset: ["top", "bottom", "left", "right"],
  },
});

const colors = vars.palette;

const colorProperties = defineProperties({
  properties: {
    color: colors,
    background: colors,
  },
});

export const sprinkles = createSprinkles(
  responsiveProperties,
  unresponsiveProperties,
  colorProperties,
);

// It's a good idea to export the Sprinkles type too
export type Sprinkles = Parameters<typeof sprinkles>[0];
