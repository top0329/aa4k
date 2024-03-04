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
