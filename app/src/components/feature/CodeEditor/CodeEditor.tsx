// src/components/ui/CodeEditor/CodeEditor.tsx
import { faCheck, faClipboard, faExpandAlt } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Button } from '@radix-ui/themes';
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
import { sCodeEditor, sCodeEditorFullScreen } from './CodeEditor.css';
import { useCodeEditorLogic } from './useCodeEditorLogic';

const CodeEditor = () => {
  const { code, copySuccess, handleCodeChange,
    toggleFullScreen,
    copyCodeToClipboard,
    isFullScreen,
    handleRunCode
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
          <Button variant={copySuccess ? 'solid' : 'soft'} onClick={copyCodeToClipboard}
            style={{
              transition: 'all 0.1s ease-in-out',
            }}
          >
            {copySuccess ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faClipboard} />}
          </Button>
          <Button
            variant={
              isFullScreen ? 'solid' : 'soft'
            }
            onClick={toggleFullScreen}
            style={{
              transition: 'all 0.1s ease-in-out',
            }}
          >
            <FontAwesomeIcon icon={faExpandAlt} />
          </Button>
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
        <Box
          width={'100%'}
          p={'4'}
          style={{
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Button variant='soft' size={'3'} onClick={() => handleRunCode}>コード実行</Button>
        </Box>
      </Box>
    </Box>
  )
}

export default CodeEditor
