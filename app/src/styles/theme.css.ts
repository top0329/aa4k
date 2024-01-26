import Color from "@radix-ui/colors";
import { createTheme } from "@vanilla-extract/css";

export const [themeClass, vars] = createTheme({
  color: {
    ...Color,
  },
});
