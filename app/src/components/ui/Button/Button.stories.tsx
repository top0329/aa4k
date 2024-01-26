// components/ui/Button/Button.stories.tsx
import { faSparkles } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from '@radix-ui/themes';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Button',
  component: Button,
};

export const Default = () => (
  <Button onClick={action('clicked')}>
    <FontAwesomeIcon icon={faSparkles} />
  </Button>
);
