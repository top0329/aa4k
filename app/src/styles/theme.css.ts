import { createGlobalTheme } from "@vanilla-extract/css";

const grid = 4;
const px = (value: string | number) => `${value}px`;

export const vars = createGlobalTheme("#kintone-copilot-root", {
  fonts: {
    brand: 'Shrikhand, "Helvetica Neue", HelveticaNeue, Helvetica, sans-serif',
    heading:
      '"DM Sans", "Helvetica Neue", HelveticaNeue, Helvetica, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", HelveticaNeue, Helvetica, Arial, sans-serif',
    code: 'ml, "Roboto Mono", Menlo, monospace',
  },
  spacing: {
    none: "0",
    xs: px(1 * grid),
    sm: px(2 * grid),
    md: px(3 * grid),
    lg: px(5 * grid),
    xl: px(8 * grid),
    ["2xlarge"]: px(12 * grid),
    ["3xlarge"]: px(24 * grid),
  },
  contentWidth: {
    xs: px(480),
    sm: px(600),
    md: px(740),
    lg: px(960),
    ["2xl"]: px(1120),
    ["3xl"]: px(1350),
  },
  palette: {
    grayIron25: "#fcfcfc",
    grayIron50: "#fafafa",
    grayIron100: "#f4f4f5",
    grayIron200: "#e4e4e7",
    grayIron300: "#d1d1d6",
    grayIron400: "#a0a0ab",
    grayIron500: "#70707b",
    grayIron600: "#51525c",
    grayIron700: "#3f3f46",
    grayIron800: "#26272b",
    grayIron900: "#18181b",
  },
  text: {
    size: {
      xs: px(12),
      sm: px(14),
      md: px(16),
      lg: px(18),
      xl: px(20),
      ["2xl"]: px(24),
      ["3xl"]: px(32),
    },
    weight: {
      light: "100",
      regular: "400",
      medium: "500",
      semibold: "600",
      bold: "800",
      black: "900",
    },
  },
  border: {
    radius: {
      sm: px(2 * grid),
      md: px(4 * grid),
      lg: px(7 * grid),
      full: "9999px",
    },
  },
  gradient: {
    primary: `linear-gradient(270deg, #b18aff 0%, #0bf 100%)`,
  },
});
