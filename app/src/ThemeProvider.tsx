import { Theme } from "@radix-ui/themes";
import '@radix-ui/themes/styles.css';
import './styles/theme-config.css';
import { themeClass } from "./styles/theme.css";

const ThemeProvider = (
  { children }: { children: React.ReactNode }
) => {
  return (
    <Theme className={themeClass}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        minWidth: 1,
        minHeight: 1,
      }}
    >
      {children}
    </Theme>
  );
}

export default ThemeProvider;
