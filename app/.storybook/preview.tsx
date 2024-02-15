// .storybook/preview.js
import '@radix-ui/themes/styles.css';
import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import React from 'react';
import ThemeProvider from '../src/ThemeProvider';
import './mocks/kintoneMocks';

initialize({
  onUnhandledRequest: 'bypass'
})

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
  loaders: [mswLoader],
  decorators: [
    Story => (
      <ThemeProvider>
        <Story />
      </ThemeProvider>
    )
  ]
};

export default preview;
