// src/components/feature/PromptForm/PromptForm.tsx
import { faSparkles } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Flex } from '@radix-ui/themes';
import { PromtTextArea } from "~/components/ui/PromtTextarea/PromtTextArea";
import { usePromptFormLogic } from "./usePromptFormLogic";

const PromptForm = () => {
  const {
    handleSubmit,
    humanMessage,
    setHumanMessage
  } = usePromptFormLogic();

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <Flex direction={'column'} position={'relative'}>
        <PromtTextArea
          name="humanMessage"
          value={humanMessage}
          onChange={
            (e) => setHumanMessage(e.target.value)
          }
          label=""
        />
        <Box position={'absolute'} style={{ bottom: '8px', right: '8px' }}>
          <Button type="submit" disabled={!humanMessage}>
            <FontAwesomeIcon icon={faSparkles} />
          </Button>
        </Box>
      </Flex>
    </form>
  );
};

export default PromptForm;
