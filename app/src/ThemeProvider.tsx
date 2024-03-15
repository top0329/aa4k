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
    <Theme className={themeClass}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        minWidth: '100vw',
        minHeight: '100vh',
      }}
    >
      {children}
    </Theme>
  );
}

export default ThemeProvider;
