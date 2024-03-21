// src/components/feature/PromptForm/PromptForm.tsx
import { faMicrophone, faSparkles } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Badge, Box, Button, Flex, Text } from '@radix-ui/themes';
import { motion } from "framer-motion";
import { PromptTextArea } from "~/components/ui/PromptTextarea/PromptTextArea";
import ToggleSwitch from '~/components/ui/ToggleSwitch/ToggleSwitch';
import { vars } from '~/styles/theme.css';
import { sVoiceInput, sVoiceInputActive, sVoiceInputDisabled } from './PromptForm.css';
import { usePromptFormLogic } from "./usePromptFormLogic";

type PromptFormProps = {
  isLoading: boolean;
  startLoading?: () => void;
  stopLoading?: () => void;
  isChangeCodeRef?: React.MutableRefObject<boolean>;
  humanMessage: string;
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  setCallbackFuncs: React.Dispatch<React.SetStateAction<Function[] | undefined>>;
  aiAnswerRef: React.MutableRefObject<string>;
  finishAiAnswerRef: React.MutableRefObject<boolean>;
}

const PromptForm: React.FC<PromptFormProps> = ({ isLoading, startLoading, stopLoading, isChangeCodeRef, humanMessage, setHumanMessage, setCallbackFuncs, aiAnswerRef, finishAiAnswerRef }) => {
  const {
    isVoiceInput,
    isPcViewMode,
    handleSubmit,
    handleKeyDown,
    handleVoiceInput,
    handleHumanMessageChange,
    handleViewModeChange,
    isSubmitting,
    voiceInputVisible,
  } = usePromptFormLogic({ humanMessage, setHumanMessage, setCallbackFuncs, aiAnswerRef, finishAiAnswerRef, startLoading, stopLoading, isChangeCodeRef });

  // Define animation variants for the submit button
  const buttonVariants = {
    enabled: { opacity: 1, scale: 1 },
    disabled: { opacity: 0.5, scale: 0.95 },
  };

  // 音声入力ボタンのclassNameを決定
  const getVoiceInputButtonClassName = () => {
    if (isSubmitting || isLoading) {
      return sVoiceInputDisabled
    } else if (isVoiceInput) {
      return sVoiceInputActive
    } else {
      return sVoiceInput
    }
  }

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
                Ctrl + Enterで送信
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
            disabled={isSubmitting || isLoading}
          />
        </Flex>

        <Flex gap="2" pt={'3'}
          align={'center'}
          justify={'between'}
        >
          <Flex gap="2" align={'center'}>
            <ToggleSwitch isOn={isPcViewMode} onToggle={handleViewModeChange} disabled={isLoading} />
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
                cursor: 'pointer',
              }}
              variant={'ghost'}
              color={isVoiceInput ? 'crimson' : 'gray'}
              className={getVoiceInputButtonClassName()}
              onClick={(e) => handleVoiceInput(e)}
              disabled={isSubmitting || isLoading}
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
                type="submit" disabled={!humanMessage || isSubmitting || isLoading}
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
