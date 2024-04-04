// src/components/ui/CodeEditor/CodeEditor.tsx
import { faArrowsRetweet, faCompressAlt, faExpandAlt } from '@fortawesome/pro-duotone-svg-icons';
import { Badge, Box, Button, Flex, Separator } from '@radix-ui/themes';
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
import CodeActionDialog from "~/components/feature/CodeActionDialog/CodeActionDialog";
import CloseButton from '~/components/ui/CloseButton/CloseButton';
import CopyButton from '~/components/ui/Copy/Copy';
import IconTooltipButton from '~/components/ui/IconTooltipButton/IconTooltipButton';
import { CodeActionDialogType } from '~/constants';
import { ViewModeState } from '~/state/viewModeState';
import { vars } from '~/styles/theme.css';
import { sCodeEditor, sCodeEditorFullScreen } from './CodeEditor.css';
import { useCodeEditorLogic } from './useCodeEditorLogic';

type CodeEditorProps = {
  isChangeCodeRef: React.MutableRefObject<boolean>;
  isLoading: boolean;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ isChangeCodeRef, isLoading }) => {
  const {
    copySuccess,
    isFullScreen,
    code,
    setCodeLatest,
    setIsChangeCode,
    isCodeActionDialog,
    setIsCodeActionDialog,
    dialogType,
    setDialogType,
    handleCodeChange,
    toggleFullScreen,
    copyToClipboard,
    handleRunCodeAction,
    handleRefreshClick,
    toggleItemVisibility
  } = useCodeEditorLogic(isChangeCodeRef);
  const [isPcViewMode] = useAtom(ViewModeState);

  const codeActionDialogProps = {
    code,
    setCodeLatest,
    setIsChangeCode,
    isCodeActionDialog,
    setIsCodeActionDialog,
    dialogType,
    setDialogType
  }

  return (
    <>
      <Flex
        direction={'column'}
        className={clsx(
          !isFullScreen ?
            sCodeEditor : sCodeEditorFullScreen
        )}
        style={isPcViewMode ? {
          border: `4px solid ${vars.color.primaryEleBg}`,
        } : {
          border: `4px solid ${vars.color.accentEleBg}`,
        }}
      >
        <CloseButton
          top={-12}
          right={-8}
          onClick={() => toggleItemVisibility('codeEditorVisible')} />
        <Flex
          py={'3'}
          pr={'3'}
          justify={'end'}
        >
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
              padding: 8,
              borderRadius: 8,
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
            }} />
          <CopyButton isCopied={copySuccess} onCopy={() => copyToClipboard(code)} />
          {isFullScreen ? (
            <IconTooltipButton
              icon={faCompressAlt}
              tooltip={'元の大きさに戻す'}
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
          ) : (
            <IconTooltipButton
              icon={faExpandAlt}
              tooltip={'最大化'}
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
          )}
        </Flex>
        <Box
          width={'100%'}
          px={'4'}
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
            justify={isFullScreen ? 'between' : 'end'}
            mb={'3'}
            style={{
              gap: 16,
            }}
          >
            {
              isFullScreen &&
              <Flex
                display={'inline-flex'}
                align={'center'}
                justify={'center'}
              >
                {isPcViewMode ? <Badge color='iris'>PC用アプリを編集しています</Badge> : <Badge color='cyan'>スマートフォン用アプリを編集しています</Badge>
                }
              </Flex>
            }
            <Flex
              align={'center'}
              justify={'end'}
              style={{
                gap: 16,
              }}
            >
              <Button variant='soft' color='crimson' size={'3'}
                onClick={() => handleRunCodeAction(CodeActionDialogType.CodeCheck)}
                style={{
                  cursor: !code ? 'not-allowed' : 'pointer',
                }}
                disabled={!code || isLoading}
              >
                チェック
              </Button>
              <Button variant='classic' color={
                isPcViewMode
                  ? 'iris'
                  : 'cyan'
              } size={'3'}
                onClick={() => handleRunCodeAction(CodeActionDialogType.CodeFix)}
                style={{
                  cursor: !code ? 'not-allowed' : 'pointer',
                }}
                disabled={!code || isLoading}
              >
                反映
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Flex>
      {isCodeActionDialog &&
        <CodeActionDialog
          {...codeActionDialogProps}
        />}
    </>
  )
}

export default CodeEditor
