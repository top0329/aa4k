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
} as Meta;

const positions = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-right',
  'bottom-center',
  'bottom-left',
] as const;

export const Default = () => {
  const { showToast } = useToast();

  return (
    <Flex align={'center'} justify={'center'} gap={'6'} wrap={'wrap'}>
      {positions.map((position) => (
        <Button
          key={position}
          onClick={() =>
            showToast(
              `現在のバージョンでは利用できません。管理者にお問い合わせください。`,
              3000,
              true,
              position
            )
          }
          color="tomato"
        >
          {position}
        </Button>
      ))}
      {positions.map((position) => (
        <Button
          key={position}
          onClick={() =>
            showToast(
              `現在のバージョンでは利用できません。管理者にお問い合わせください。`,
              3000,
              false,
              position
            )
          }
          color="tomato"
          variant='outline'
        >
          {position} timeout: false
        </Button>
      ))}
    </Flex>
  );
};
