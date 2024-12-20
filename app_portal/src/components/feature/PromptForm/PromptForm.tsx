// src/components/feature/PromptForm/PromptForm.tsx

import { faRotateRight, faMicrophone } from '@fortawesome/pro-duotone-svg-icons';
import { faPaperPlaneTop } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button, Flex, Separator, Text, Tooltip } from '@radix-ui/themes';
import { motion } from "framer-motion";
import { PromptTextArea } from '~/components/ui/PromptTextarea/PromptTextArea';
import { sClearConversation, sClearConversationDisabled, sPromptForm, sVoiceInput, sVoiceInputActive, sVoiceInputDisabled } from './PromptForm.css';
import { usePromptFormLogic } from "./usePromptFormLogic";

type PromptFormProps = {
  humanMessage: string;
  setHumanMessage: React.Dispatch<React.SetStateAction<string>>;
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
  isInitVisible: boolean;
  setIsInitVisible: React.Dispatch<React.SetStateAction<boolean>>;
  aiAnswer: string,
  setAiAnswer: React.Dispatch<React.SetStateAction<string>>,
  finishAiAnswer: boolean,
  setFinishAiAnswer: React.Dispatch<React.SetStateAction<boolean>>,
  setIsShowDetailDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const PromptForm: React.FC<PromptFormProps> = ({ humanMessage, setHumanMessage, scrollRef, isInitVisible, setIsInitVisible, aiAnswer, setAiAnswer, finishAiAnswer, setFinishAiAnswer, setIsShowDetailDialogVisible }) => {

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
    initialFocusRef,
  } = usePromptFormLogic({ humanMessage, setHumanMessage, scrollRef, isInitVisible, setIsInitVisible, aiAnswer, setAiAnswer, finishAiAnswer, setFinishAiAnswer, setIsShowDetailDialogVisible });

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
      {/* ダミーの非表示要素（初期フォーカスの対象） */}
      <Box ref={initialFocusRef} tabIndex={-1} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} />
      <form
        onSubmit={(e) => handleSubmit(e)}
        style={{
          paddingLeft: '6%',
          paddingTop: '3.25%',
          paddingRight: '6%',
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
          style={{ marginRight: `1%` }}
        >
          <Flex
            align={'center'}
            justify={'start'}
            style={{
              height: 20,
              marginTop: `-5%`,
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
          <Flex gap={'4'}
            justify={'center'}
            align={'center'}
          >
            <Button
              style={{
                width: 42,
                height: 42,
                borderRadius: `20%`,
                padding: 0,
                cursor: 'pointer',
                color: '#2E3192',
                opacity: isSubmitting ? 0.5 : 1,
              }}
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
                <FontAwesomeIcon size='xl' icon={faRotateRight} />
              </Tooltip>
            </Button>
            <Separator orientation="vertical" />
            {voiceInputVisible && (<Button
              style={{
                width: 42,
                height: 42,
                borderRadius: `20%`,
                padding: 0,
                cursor: 'pointer',
                color: isVoiceInput ? 'crimson' : '#2E3192',
                backgroundColor: isVoiceInput ? '#F8E2EF' : '',
                opacity: isSubmitting ? 0.5 : 1,
              }}
              variant={'ghost'}
              className={getVoiceInputButtonClassName()}
              onClick={(e) => handleVoiceInput(e)}
              disabled={isSubmitting}
            >
              <Tooltip
                content={isVoiceInput ? "音声入力を終了する" : "音声入力を開始する"}
                style={{
                  zIndex: 10000,
                }}
              >
                <FontAwesomeIcon size='xl' icon={faMicrophone} />
              </Tooltip>
            </Button>
            )}
            <Separator orientation="vertical" />
            <Button
              style={{
                cursor: 'pointer',
                width: 42,
                height: 42,
                borderRadius: `20%`,
                padding: 0,
                color: humanMessage && 'white',
                backgroundColor: humanMessage && '#5459FF',
                opacity: isSubmitting || !humanMessage ? 0.5 : 1,
                transition: "opacity 0.2s",
              }}
              type="submit"
              disabled={isSubmitting || !humanMessage}
              variant={'ghost'}
            >
              <Tooltip
                content={"送信する"}
                style={{
                  zIndex: 10000,
                }}
              >
                <FontAwesomeIcon size='xl' icon={faPaperPlaneTop} />
              </Tooltip>
            </Button>
          </Flex>
        </Flex>
      </form >
    </Box>
  );
};

export default PromptForm;
