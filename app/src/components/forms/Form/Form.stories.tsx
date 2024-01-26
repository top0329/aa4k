// src/components/forms/Form.stories.tsx
import { Meta } from '@storybook/react';
import { Form } from './Form';

export default {
  title: 'Forms/Form',
  component: Form,
} as Meta;

export const PromptForm = () => <Form onSubmit={() => { }} />;
