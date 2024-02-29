// src/components/ui/CodeEditor/CodeEditor.tsx
import { faArrowsRetweet, faExpandAlt } from '@fortawesome/pro-duotone-svg-icons';
import { Box, Button, Flex, Separator } from '@radix-ui/themes';
import 'ace-builds/src-min-noconflict/ace';
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/ext-searchbox";
import 'ace-builds/src-min-noconflict/mode-javascript';
import "ace-builds/src-min-noconflict/snippets/javascript";
import "ace-builds/src-min-noconflict/snippets/snippets";
import "ace-builds/src-min-noconflict/theme-monokai";
import 'ace-builds/src-min-noconflict/theme-tomorrow';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import AceEditor from "react-ace-builds";
import CopyButton from '~/components/ui/Copy/Copy';
import IconTooltipButton from '~/components/ui/IconTooltipButton/IconTooltipButton';
import { CodeActionDialogType } from '~/constants';
import { vars } from '~/styles/theme.css';
import { ViewModeState } from '../CornerDialog/CornerDialogState';
import { sCodeEditor, sCodeEditorFullScreen } from './CodeEditor.css';
import { useCodeEditorLogic } from './useCodeEditorLogic';

const CodeEditor = () => {
  const { code, copySuccess, handleCodeChange,
    toggleFullScreen,
    copyToClipboard,
    isFullScreen,
    handleRunCodeAction,
    handleRefreshClick
  } = useCodeEditorLogic();
  // リファクタリング時に対応想定
  const [isPcViewMode] = useAtom(ViewModeState);

  return (
    <Flex
      direction={'column'}
      p={'3'}
      className={clsx(
        !isFullScreen ?
          sCodeEditor : sCodeEditorFullScreen
      )}
      style={isPcViewMode ? {
        border: `8px solid ${vars.color.indigo.indigo3}`,
      } : {
        border: `8px solid ${vars.color.crimson.crimson3}`,
      }}
    >
      <Flex
        justify={'end'}
      >
        {/* TODO: リフレッシュボタン仮置き 後で正式版に差し替え予定 */}
        <IconTooltipButton
          icon={faArrowsRetweet}
          tooltip={'Code ReNew'}
          onClick={handleRefreshClick}
          style={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
          }} />
        <CopyButton isCopied={copySuccess} onCopy={() => copyToClipboard(code)} />
        <IconTooltipButton
          icon={faExpandAlt}
          tooltip={'FullScreen'}
          onClick={toggleFullScreen}
          style={{
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
          }} />
      </Flex>

      <Separator my="3" size="4" />
      <Box
        width={'100%'}
        style={{
          position: 'relative',
          height: '100%',
        }}
      >
        <AceEditor
          className={clsx('scrollbar')}
          style={
            !isFullScreen ? {
              width: '100%',
              minHeight: 500,
            } : {
              width: '100%',
              height: 'calc(100% - 80px)',
            }
          }
          mode="javascript"
          theme='tomorrow'
          fontSize={14}
          showPrintMargin={false}
          showGutter={true}
          highlightActiveLine={true}
          onChange={handleCodeChange}
          value={code}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            enableSnippets: true,
            showLineNumbers: true,
            tabSize: 2,
            useWorker: false
          }} />
        <Separator my="3" size="4" />
        <Flex
          width={'100%'}
          justify={'end'}
          style={{
            gap: 16,
          }}
        >
          <Button variant='soft' color='crimson' size={'3'}
            onClick={() => handleRunCodeAction(CodeActionDialogType.CodeCheck)}
            style={{
              cursor: 'pointer',
            }}>
            チェック
          </Button>
          <Button variant='soft' size={'3'}
            onClick={() => handleRunCodeAction(CodeActionDialogType.CodeFix)}
            style={{
              cursor: 'pointer',
            }}>
            反映
          </Button>
        </Flex>
      </Box>
    </Flex>
  )
}

export default CodeEditor
