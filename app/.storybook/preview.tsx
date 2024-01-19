// storybook v7 preview.tsx
import '@radix-ui/themes/styles.css';
import type { Preview } from '@storybook/react';
import React from 'react';
import ThemeProvider from '../src/ThemeProvider';


const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  decorators: [
    Story => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    )
  ]
};

export default preview;
