// src/components/ui/ErrorToast/ErrorToast.stories.tsx
import { Button, Flex } from '@radix-ui/themes';
import { Meta } from '@storybook/react';
import ErrorToast from './ErrorToast';
import { ErrorToastProvider, useToast } from './ErrorToastProvider';

export default {
  title: 'UI/ErrorToast',
  component: ErrorToast,
  decorators: [
    (Story) => (
      <ErrorToastProvider>
        <Story />
      </ErrorToastProvider>
    ),
  ],
} as Meta; // Add Meta type for clarity

export const Default = () => {
  const { showToast } = useToast();
  return (
    <Flex
      align={'center'}
      justify={'center'}
      gap={'6'}
      direction={'column'}
    >
      <Button
        onClick={() => showToast(' 現在のバージョンでは利用できません。管理者にお問い合わせください。', 0, false)}
        color='tomato'
      >
        Timeout false
      </Button>
      <Button
        onClick={() => showToast(' 現在のバージョンでは利用できません。管理者にお問い合わせください。')}
        color='tomato'
      >
        timeout 3000
      </Button>
    </Flex>)
};
