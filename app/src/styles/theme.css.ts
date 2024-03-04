import Color from "@radix-ui/colors";
import { createTheme } from "@vanilla-extract/css";

export const [themeClass, vars] = createTheme({
  color: {
    ...Color,
    primaryBg: Color.iris.iris1,
    primarySubBg: Color.iris.iris2,
    primaryEleBg: Color.iris.iris3,
    primaryEleHoverbg: Color.iris.iris4,
    primaryActive: Color.iris.iris5,
    primarySubBorder: Color.iris.iris6,
    primaryFocus: Color.iris.iris7,
    primaryHoverBorder: Color.iris.iris8,
    primarySolidBg: Color.iris.iris9,
    primarySolidHover: Color.iris.iris10,
    primaryText: Color.iris.iris11,
    primaryHiContrastText: Color.iris.iris12,
    accentBg: Color.cyan.cyan1,
    accentSubBg: Color.cyan.cyan2,
    accentEleBg: Color.cyan.cyan3,
    accentEleHoverbg: Color.cyan.cyan4,
    accentActive: Color.cyan.cyan5,
    accentSubBorder: Color.cyan.cyan6,
    accentFocus: Color.cyan.cyan7,
    accentHoverBorder: Color.cyan.cyan8,
    accentSolidBg: Color.cyan.cyan9,
    accentSolidHover: Color.cyan.cyan10,
    accentText: Color.cyan.cyan11,
    accentHiContrastText: Color.cyan.cyan12,
  },
});
