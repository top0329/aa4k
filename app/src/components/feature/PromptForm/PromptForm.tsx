// src/components/feature/PromptForm/PromptForm.tsx
import { faMicrophone, faSparkles } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Box, Button, Flex, Switch, Text } from '@radix-ui/themes';
import { motion } from "framer-motion";
import { PromtTextArea } from "~/components/ui/PromtTextarea/PromtTextArea";
import { vars } from '~/styles/theme.css';
import { sVoiceInput, sVoiceInputActive } from './PromptForm.css';
import { usePromptFormLogic } from "./usePromptFormLogic";

const PromptForm = () => {
  const {
    isVoiceInput,
    setVoiceInput,
    isPcViewMode,
    setIsPcViewMode,
    humanMessage,
    setHumanMessage,
    handleSubmit,
    handleKeyDown
  } = usePromptFormLogic();

  // Define animation variants for the submit button
  const buttonVariants = {
    enabled: { opacity: 1, scale: 1 },
    disabled: { opacity: 0.5, scale: 0.95 },
  };

  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <Box p={'5'}
        width={'100%'}
        style={{
          background: isPcViewMode ? vars.color.indigoA.indigoA2 : vars.color.crimsonA.crimsonA1
        }}>

        <Flex direction={'column'} position={'relative'} gap={'1'}>
          <Flex
            align={'center'}
            justify={'end'}
            style={{
              height: 20,

            }}
          >
            <motion.div
              animate={humanMessage
                ? { opacity: 1 }
                : { opacity: 0 }
              }
            >

              <Text trim="both" size={'1'} color='gray' align={'right'}
                style={{
                  transform: 'scale(0.8)',
                }}
              >
                Shift + Enterで送信
              </Text>
            </motion.div>
          </Flex>
          <PromtTextArea
            name="humanMessage"
            value={humanMessage}
            onChange={
              (e) => setHumanMessage(e.target.value)
            }
            onKeyDown={(e) => handleKeyDown(e)}
            label=""
          />
        </Flex>

        <Flex gap="2" pt={'3'}
          align={'center'}
          justify={'between'}
        >
          <Flex gap="2" align={'center'}>
            <Switch
              color={
                isPcViewMode
                  ? 'indigo'
                  : 'crimson'
              }
              checked={!isPcViewMode}
              onCheckedChange={() => setIsPcViewMode(!isPcViewMode)}
            />

            {
              isPcViewMode ? <Badge>スマートフォン用アプリのカスタマイズに切り替える</Badge> : <Badge color='crimson'>PC用アプリのカスタマイズに切り替える</Badge>
            }
          </Flex>
          <Flex gap={'5'}
            justify={'center'}
            align={'center'}
          >

            <Button
              variant={'ghost'}
              color={isVoiceInput ? 'crimson' : 'gray'}
              className={isVoiceInput ? sVoiceInputActive : sVoiceInput}
              onClick={(e) => {
                e.preventDefault();
                setVoiceInput(!isVoiceInput)
              }}
            >
              <FontAwesomeIcon size='lg' icon={faMicrophone} />
            </Button>
            {/* Wrap the submit button in a motion.div and control the animation */}
            <motion.div
              variants={buttonVariants}
              initial={humanMessage ? 'enabled' : 'disabled'}
              animate={humanMessage ? 'enabled' : 'disabled'}
            >
              <Button
                type="submit" disabled={!humanMessage}
                style={{
                  cursor: !humanMessage ? 'not-allowed' : 'pointer',
                  width: 32,
                  height: 32,
                }}
              >
                <FontAwesomeIcon icon={faSparkles} />
              </Button>
            </motion.div>
          </Flex>
        </Flex>
      </Box>
    </form >
  );
};

export default PromptForm;
