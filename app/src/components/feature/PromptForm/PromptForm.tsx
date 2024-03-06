// src/components/feature/PromptForm/PromptForm.tsx
import { faMicrophone, faSparkles } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Box, Button, Flex, Switch, Text } from '@radix-ui/themes';
import { motion } from "framer-motion";
import { useUpdateEffect } from "react-use";
import { PromptTextArea } from "~/components/ui/PromptTextarea/PromptTextArea";
import { useTextSpeech } from "~/hooks/useTextSpeech";
import { vars } from '~/styles/theme.css';
import { sVoiceInput, sVoiceInputActive } from './PromptForm.css';
import { usePromptFormLogic } from "./usePromptFormLogic";

type PromptFormProps = {
  startLoading?: () => void;
  stopLoading?: () => void;
  isChangeCodeRef?: React.MutableRefObject<boolean>;
}

const PromptForm: React.FC<PromptFormProps> = ({ startLoading, stopLoading, isChangeCodeRef }) => {
  const {
    isVoiceInput,
    isPcViewMode,
    humanMessage,
    handleSubmit,
    handleKeyDown,
    handleVoiceInput,
    handleHumanMessageChange,
    handleViewModeChange,
    isSubmitting,
    execCallbacks,
    voiceInputVisible,
    aiAnswerRef,
    finishAiAnswerRef,
  } = usePromptFormLogic(startLoading, stopLoading, isChangeCodeRef);
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
    <Box p={'5'}
      width={'100%'}
      style={{
        background: isPcViewMode ? vars.color.primarySubBg : vars.color.accentBg
      }}>
      <form onSubmit={(e) => handleSubmit(e)}>

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
            isPcViewMode={isPcViewMode}
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
                  ? 'iris'
                  : 'cyan'
              }
              checked={!isPcViewMode}
              onCheckedChange={handleViewModeChange}
              disabled={isSubmitting}
            />

            {
              isPcViewMode ? <Badge color='iris'>スマートフォン用アプリのカスタマイズに切り替える</Badge> : <Badge color='cyan'>PC用アプリのカスタマイズに切り替える</Badge>
            }
          </Flex>
          <Flex gap={'5'}
            justify={'center'}
            align={'center'}
          >

            {voiceInputVisible && (<Button
              style={{
                width: 32,
                height: 32,
                borderRadius: `50%`,
                padding: 0,
              }}
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
                color={isPcViewMode ? 'iris' : 'cyan'}
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
      </form >
    </Box>
  );
};

export default PromptForm;
