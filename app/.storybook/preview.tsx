// .storybook/preview.js
import '@radix-ui/themes/styles.css';
import type { Preview } from '@storybook/react';
import { initialize, mswLoader } from 'msw-storybook-addon';
import React from 'react';
import "regenerator-runtime/runtime";
import ThemeProvider from '../src/ThemeProvider';
import '../src/mocks/kintoneMocks';

initialize({
  onUnhandledRequest: 'bypass'
})

const preview: Preview = {
  parameters: {
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
