// src/components/feature/DataGen/PromptForm/PromptForm.tsx
import { faRotateRight, faMicrophone, faSparkles } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Flex, Text, Tooltip } from '@radix-ui/themes';
import { motion } from "framer-motion";
import { PromptTextArea } from "~/components/ui/Origin/PromptTextarea/PromptTextArea";
import { vars } from '~/styles/theme.css';
import { sClearConversation, sClearConversationDisabled, sProcessingStateActive, sPromptForm, sVoiceInput, sVoiceInputActive, sVoiceInputDisabled } from './PromptForm.css';
import { usePromptFormLogic } from "./usePromptFormLogic";
import { DockDisplayTypes, InfoMessage } from '~/constants';

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
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
}

const PromptForm: React.FC<PromptFormProps> = ({ isLoading, startLoading, stopLoading, isChangeCodeRef, humanMessage, setHumanMessage, setCallbackFuncs, aiAnswerRef, finishAiAnswerRef, scrollRef }) => {
  const {
    isVoiceInput,
    isPcViewMode,
    handleSubmit,
    handleKeyDown,
    handleVoiceInput,
    handleHumanMessageChange,
    handleClearConversation,
    isSubmitting,
    voiceInputVisible,
    activeFunctionState,
  } = usePromptFormLogic({ humanMessage, setHumanMessage, setCallbackFuncs, aiAnswerRef, finishAiAnswerRef, startLoading, stopLoading, isChangeCodeRef, scrollRef });

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

  // 他機能でAI実行中かどうかの判定フラグ（初期値はnull：どの機能でもAI未実行）
  const { dataGen } = DockDisplayTypes;
  const isActiveFunctionDataGen = !activeFunctionState || activeFunctionState === dataGen;

  return (
    <Box
      className={sPromptForm}
      px={'5'}
      pb={'5'}
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
          <Flex
            width={'100%'}>
            <Text size={'1'} color='gray'
              style={{
                opacity: 0.5,
              }}
            >
              AIが生成する回答には間違いが含まれる可能性があります。予めご了承ください。
            </Text>
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
            disabled={!isActiveFunctionDataGen || isSubmitting || isLoading}
          />
          {!isActiveFunctionDataGen && <Box className={sProcessingStateActive}>{InfoMessage.I_MSG006}</Box>}
        </Flex>

        <Flex gap="2" pt={'3'}
          align={'center'}
          justify={'end'}
        >
          <Flex gap={'5'}
            justify={'center'}
            align={'center'}
          >
            <Button
              style={{
                width: 32,
                height: 32,
                borderRadius: `50%`,
                padding: 0,
                cursor: 'pointer',
              }}
              color={'gray'}
              variant={'ghost'}
              className={isSubmitting || isLoading ? sClearConversationDisabled : sClearConversation}
              onClick={(e) => { handleClearConversation(e) }}
              disabled={!isActiveFunctionDataGen || isSubmitting || isLoading}
            >
              <Tooltip
                content={"新しく会話を始める"}
                style={{
                  zIndex: 10000,
                }}
              >
                <FontAwesomeIcon size='lg' icon={faRotateRight} />
              </Tooltip>
            </Button>
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
              disabled={!isActiveFunctionDataGen || isSubmitting || isLoading}
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
                  cursor: 'pointer',
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
