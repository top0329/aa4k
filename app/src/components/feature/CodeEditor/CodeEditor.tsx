// src/components/ui/CodeEditor/CodeEditor.tsx
import { faExpandAlt } from '@fortawesome/pro-duotone-svg-icons';
import { Box, Button, Flex } from '@radix-ui/themes';
import 'ace-builds/src-min-noconflict/ace';
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/ext-searchbox";
import 'ace-builds/src-min-noconflict/mode-javascript';
import "ace-builds/src-min-noconflict/snippets/javascript";
import "ace-builds/src-min-noconflict/snippets/snippets";
import "ace-builds/src-min-noconflict/theme-monokai";
import 'ace-builds/src-min-noconflict/theme-tomorrow';
import clsx from 'clsx';
import AceEditor from "react-ace-builds";
import CopyButton from '~/components/ui/Copy/Copy';
import IconTooltipButton from '~/components/ui/IconTooltipButton/IconTooltipButton';
import { CodeActionDialogType } from '~/types/codeActionTypes';
import { sCodeEditor, sCodeEditorFullScreen } from './CodeEditor.css';
import { useCodeEditorLogic } from './useCodeEditorLogic';

const CodeEditor = () => {
  const { code, copySuccess, handleCodeChange,
    toggleFullScreen,
    copyToClipboard,
    isFullScreen,
    handleRunCodeAction
  } = useCodeEditorLogic();

  return (
    <Box className={clsx(
      !isFullScreen ?
        sCodeEditor : sCodeEditorFullScreen
    )}>
      <Box
        width={'100%'}
        style={{
          position: 'relative',
          height: '100%',
        }}
      >
        <Box
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 101,
            display: 'flex',
            gap: '16px',
          }}
        >
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
              padding: 8,
              borderRadius: 8,
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
            }} />
        </Box>

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
        <Flex
          width={'100%'}
          p={'4'}
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
    </Box>
  )
}

export default CodeEditor
