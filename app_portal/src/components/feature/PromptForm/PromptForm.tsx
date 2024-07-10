// src/components/feature/PromptForm/PromptForm.tsx

import { faRotateRight, faPaperPlaneTop, faMicrophone } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Flex, Separator, Text, Tooltip } from '@radix-ui/themes';
import { motion } from "framer-motion";
import { PromptTextArea } from '~/components/ui/PromptTextarea/PromptTextArea';
import { sClearConversation, sClearConversationDisabled, sPromptForm, sVoiceInput, sVoiceInputActive, sVoiceInputDisabled } from './PromptForm.css';
import { usePromptFormLogic } from "./usePromptFormLogic";

type PromptFormProps = {
  humanMessage: string;
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  // setCallbackFuncs: React.Dispatch<React.SetStateAction<Function[] | undefined>>;
  aiAnswerRef: React.MutableRefObject<string>;
  finishAiAnswerRef: React.MutableRefObject<boolean>;
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
  isInitVisible: boolean;
  setIsInitVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const PromptForm: React.FC<PromptFormProps> = ({ humanMessage, setHumanMessage, aiAnswerRef, finishAiAnswerRef, scrollRef, isInitVisible, setIsInitVisible }) => {

  // PromptFormコンポーネントのロジックを管理するカスタムフック
  const {
    isVoiceInput,
    handleSubmit,
    handleKeyDown,
    handleVoiceInput,
    handleHumanMessageChange,
    handleClearConversation,
    isSubmitting,
    voiceInputVisible,
  } = usePromptFormLogic({ humanMessage, setHumanMessage, aiAnswerRef, finishAiAnswerRef, scrollRef, isInitVisible, setIsInitVisible });

  // 送信ボタンのアニメーションのバリエーションを定義
  const buttonVariants = {
    enabled: { opacity: 1, scale: 1 },
    disabled: { opacity: 0.5, scale: 0.95 },
  };

  // 音声入力ボタンのclassNameを決定
  const getVoiceInputButtonClassName = () => {
    if (isSubmitting) {
      // 非活性（送信ボタン押下）時
      return sVoiceInputDisabled
    } else if (isVoiceInput) {
      // 活性（音声入力）時
      return sVoiceInputActive
    } else {
      // 初期表示時
      return sVoiceInput
    }
  }

  return (
    <Box className={sPromptForm} >
      <form
        onSubmit={(e) => handleSubmit(e)}
        style={{
          paddingLeft: '56px',
          paddingTop: '30px',
          paddingRight: '56px',
          height: '100%',
        }}
      >
        <Flex direction={'column'} position={'relative'} gap={'1'}>
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
        <Flex gap="2" pt={'3'} pb={'18px'}
          align={'center'}
          justify={'between'}
        >
          <Flex
            align={'center'}
            justify={'start'}
            style={{
              height: 20
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
          <Flex gap={'3'}
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
              className={isSubmitting ? sClearConversationDisabled : sClearConversation}
              onClick={(e) => { handleClearConversation(e) }}
              disabled={isSubmitting}
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
            <Separator orientation="vertical" />
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
              disabled={isSubmitting}
            >
              <Tooltip
                content={"音声入力を開始する"}
                style={{
                  zIndex: 10000,
                }}
              >
                <FontAwesomeIcon size='lg' icon={faMicrophone} />
              </Tooltip>
            </Button>
            )}
            <Separator orientation="vertical" />
            {/* 送信ボタンをmotion.divで囲み、アニメーションを制御する */}
            <motion.div
              variants={buttonVariants}
              initial={humanMessage ? 'enabled' : 'disabled'}
              animate={humanMessage ? 'enabled' : 'disabled'}
            >
              <Button
                color={'iris'}
                type="submit" disabled={!humanMessage || isSubmitting}
                variant={humanMessage ? 'solid' : 'ghost'}
                style={{
                  cursor: 'pointer',
                  width: 32,
                  height: 32,
                }}
              >
                <Tooltip
                  content={"送信する"}
                  style={{
                    zIndex: 10000,
                  }}
                >
                  <FontAwesomeIcon icon={faPaperPlaneTop} />
                </Tooltip>
              </Button>
            </motion.div>
          </Flex>
        </Flex>
      </form >
    </Box>
  );
};

export default PromptForm;
