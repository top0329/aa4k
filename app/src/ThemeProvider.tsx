import { Theme } from "@radix-ui/themes";


const ThemeProvider = (
  { children }: { children: React.ReactNode }
) => {
  return (
    <Theme>
      {children}
    </Theme>
  );
}

export default ThemeProvider;
