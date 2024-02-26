// src/components/feature/PromptForm/PromptForm.tsx
import { useUpdateEffect } from "react-use";
import { faMicrophone, faSparkles } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Box, Button, Flex, Switch, Text } from '@radix-ui/themes';
import { motion } from "framer-motion";
import { PromptTextArea } from "~/components/ui/PromptTextarea/PromptTextArea";
import { vars } from '~/styles/theme.css';
import { sVoiceInput, sVoiceInputActive } from './PromptForm.css';
import { usePromptFormLogic } from "./usePromptFormLogic";
import { useTextSpeech } from "~/hooks/useTextSpeech";

const PromptForm = () => {
  const {
    isVoiceInput,
    isPcViewMode,
    setIsPcViewMode,
    humanMessage,
    handleSubmit,
    handleKeyDown,
    handleVoiceInput,
    handleHumanMessageChange,
    isSubmitting,
    execCallbacks,
    voiceInputVisible,
    aiAnswerRef,
    finishAiAnswerRef,
  } = usePromptFormLogic();
  const { isSpeech } = useTextSpeech(
    aiAnswerRef,
    finishAiAnswerRef,
  );

  // JS生成AI機能の呼び出し後、音声出力が完了したのを確認したのちにJS生成AI機能からのcallbacksを実行する
  useUpdateEffect(() => {
    if (!isSpeech) {
      execCallbacks();
    }
  }, [isSpeech]);

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
          <PromptTextArea
            name="humanMessage"
            value={humanMessage}
            onChange={
              (e) => handleHumanMessageChange(e)
            }
            onKeyDown={(e) => handleKeyDown(e)}
            label=""
            disabled={isSubmitting}
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

            {voiceInputVisible && (<Button
              variant={'ghost'}
              color={isVoiceInput ? 'crimson' : 'gray'}
              className={isVoiceInput ? sVoiceInputActive : sVoiceInput}
              onClick={(e) => handleVoiceInput(e)}
            >
              <FontAwesomeIcon size='lg' icon={faMicrophone} />
            </Button>
            )}
            {/* Wrap the submit button in a motion.div and control the animation */}
            <motion.div
              variants={buttonVariants}
              initial={humanMessage ? 'enabled' : 'disabled'}
              animate={humanMessage ? 'enabled' : 'disabled'}
            >
              <Button
                type="submit" disabled={!humanMessage || isSubmitting}
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
