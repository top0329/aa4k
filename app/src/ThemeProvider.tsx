import "@fontsource-variable/noto-sans-jp"; // Defaults to wght axis
import "@fontsource-variable/noto-sans-jp/wght.css"; // Specify axis
import { Theme } from "@radix-ui/themes";
import '@radix-ui/themes/styles.css';
import './styles/theme-config.css';
import { themeClass } from "./styles/theme.css";

const ThemeProvider = (
  { children }: { children: React.ReactNode }
) => {
  return (
    <Theme className={themeClass}>
      {children}
    </Theme>
  );
}

export default ThemeProvider;
