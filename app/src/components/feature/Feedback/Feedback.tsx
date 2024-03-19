// src/components/feature/Feedback/Feedback.tsx
import { faClose, faThumbsDown, faThumbsUp } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Flex, TextArea } from '@radix-ui/themes';
import { useFeedbackLogic } from '~/components/feature/Feedback/useFeedbackLogic';
import Copy from '~/components/ui/Copy/Copy';
import IconTooltipButton from '~/components/ui/IconTooltipButton/IconTooltipButton';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { vars } from '~/styles/theme.css';
import { ChatHistoryItem } from "~/types/ai";


type FeedbackProps = {
  content: string;
  chatHistoryItem: ChatHistoryItem;
};

const Feedback = ({ content, chatHistoryItem }: FeedbackProps) => {
  const { copySuccess, copyToClipboard } = useCopyToClipboard();

  const {
    thumbsUpPressed,
    thumbsDownPressed,
    handleThumbsUpClick,
    handleThumbsDownClick,
    showDetailedFeedback,
    setShowDetailedFeedback,
    feedback,
    setFeedback,
    handleFeedbackSendClick,
  } = useFeedbackLogic(chatHistoryItem);

  const buttonStyle = {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: thumbsUpPressed || thumbsDownPressed ? vars.color.grayA.grayA4 : 'transparent',
    transition: 'all 0.2s ease-in-out'
  };

  return (
    <>
      <Flex aria-label="Formatting options" style={{ alignItems: 'center', gap: 16 }}>
        {!thumbsDownPressed && <IconTooltipButton
          icon={faThumbsUp}
          tooltip={"いい回答でした"}
          onClick={handleThumbsUpClick}
          pressed={thumbsUpPressed}
          style={buttonStyle}
          pressedColor={vars.color.grayA.grayA12}
          defaultColor={vars.color.gray.gray9}
        />}
        {!thumbsUpPressed && <IconTooltipButton
          icon={faThumbsDown}
          tooltip={"いまいちでした"}
          onClick={handleThumbsDownClick}
          pressed={thumbsDownPressed}
          style={buttonStyle}
          pressedColor={vars.color.grayA.grayA12}
          defaultColor={vars.color.gray.gray9}
        />}
        {
          <Copy
            isCopied={copySuccess}
            onCopy={() => copyToClipboard(content)}
          />
        }
      </Flex>
      {
        showDetailedFeedback &&
        <Flex
          style={{
            marginTop: 16,
            padding: 16,
            backgroundColor: vars.color.grayA.grayA1,
            borderRadius: 8,
            width: '100%',
          }}
          gap={'4'}
          direction={'column'}
        >
          <Flex justify={'end'}>
            <FontAwesomeIcon icon={faClose} onClick={() => setShowDetailedFeedback(false)} />
          </Flex>
          <TextArea
            placeholder="Write a comment…"
            style={{ height: 80 }}
            value={feedback}
            onChange={
              (e) => setFeedback(e.target.value)
            }
          />
          <Flex>
            <Button size="2" variant='ghost' onClick={handleFeedbackSendClick} disabled={!feedback}
              style={{
                cursor: 'pointer',
              }}
            >
              フィードバック送信
            </Button>
          </Flex>
        </Flex>
      }
    </>
  )
};

export default Feedback;