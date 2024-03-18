// .storybook/main.js
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      tsconfigPath: "./tsconfig.storybook.json",
    },
  },
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@storybook/addon-interactions",
    "msw-storybook-addon",
    "@storybook/addon-mdx-gfm"
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  staticDirs: ["../public"],
};
export default config;
