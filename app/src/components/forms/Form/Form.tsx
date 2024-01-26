// src/components/forms/Form.tsx
import { faSparkles } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Flex } from '@radix-ui/themes';
import React from 'react';
import { PromtTextArea } from "../PromtTextarea/PromtTextArea";
import { useFormLogic } from './FormLogic';

type FormProps = {
  onSubmit: (data: { example: string }) => void;
};

export const Form: React.FC<FormProps> = ({ onSubmit }) => {
  const { exampleValue, setExampleValue, handleSubmit } = useFormLogic(onSubmit);

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction={'column'} position={'relative'}>
        <PromtTextArea
          name="example"
          value={exampleValue}
          onChange={(e) => setExampleValue(e.target.value)}
          label=""
        />
        <Box position={'absolute'} style={{ bottom: '8px', right: '8px' }}>
          <Button type="submit" disabled={!exampleValue}>
            <FontAwesomeIcon icon={faSparkles} />
          </Button>
        </Box>
      </Flex>
    </form>
  );
};
