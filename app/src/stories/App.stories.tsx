// src/components/feature/CornerDialog/CornerDialog.stories.tsx
import { Meta } from '@storybook/react';
import App from '~/App';

export default {
  title: 'App',
  component: App,
} as Meta;

export const Default = () => <App pluginId={"pluginId"}/>;
