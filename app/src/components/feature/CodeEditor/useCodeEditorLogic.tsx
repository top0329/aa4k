// src/components/feature/CodeEditor/useCodeEditorLogic.tsx
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useBeforeunload } from 'react-beforeunload';
import { useToast } from "~/components/ui/ErrorToast/ErrorToastProvider";
import { CodeActionDialogType, DeviceDiv, ErrorCode, ErrorMessage, InfoMessage } from "~/constants";
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { CodeState, CodeLatestState, IsChangeCodeState } from '~/state/codeActionState';
import { DockItemVisibleState } from '~/state/dockItemState';
import { ViewModeState } from '~/state/viewModeState';
import { getKintoneCustomizeJs } from "~/util/kintoneCustomize";

export const useCodeEditorLogic = (
  isChangeCodeRef?: React.MutableRefObject<boolean>
) => {
  const [isPcViewMode] = useAtom(ViewModeState);
  const [codeLatest, setCodeLatest] = useAtom(CodeLatestState);
  const [code, setCode] = useAtom(CodeState);
  const [isChangeCode, setIsChangeCode] = useAtom(IsChangeCodeState);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [dockState, setDockState] = useAtom(DockItemVisibleState);
  const [isCodeActionDialog, setIsCodeActionDialog] = useState(false);
  const [dialogType, setDialogType] = useState<CodeActionDialogType>("codeCheck");

  const { copyToClipboard, copySuccess } = useCopyToClipboard();
  const { showToast } = useToast();

  const handleCodeEditorClick = async () => {
    if (dockState.codeEditorVisible) {
      if (isChangeCode) {
        // コードエディタのコードが編集されていたら、確認モーダルを表示
        if (window.confirm(InfoMessage.I_MSG002)) {
          setIsChangeCode(false);
          setDockState(dockState => ({ ...dockState, codeEditorVisible: !dockState.codeEditorVisible }));
        }
      } else {
        setDockState(dockState => ({ ...dockState, codeEditorVisible: !dockState.codeEditorVisible }));
      }
    } else {
      // 最新JSの取得
      await getLatestCode();
    }
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    setIsChangeCode((newCode !== codeLatest));
  };

  const handleRunCodeAction = (type: CodeActionDialogType) => {
    setDialogType(type);
    setIsCodeActionDialog(true);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      setDockState(dockState => ({ ...dockState, chatVisible: false }));
    } else {
      setDockState(dockState => ({ ...dockState, chatVisible: true }));
    }
  };

  // リフレッシュボタン押下
  const handleRefreshClick = async () => {
    let isChangeLatestCodeOk = true;
    if (isChangeCode) {
      // コードエディタのコードが編集されていたら、確認モーダルを表示
      if (!window.confirm(InfoMessage.I_MSG003)) {
        isChangeLatestCodeOk = false;
      }
    }
    if (isChangeLatestCodeOk) {
      // 最新JSの取得
      await getLatestCode();
    }
  }

  const getLatestCode = async () => {
    try {
      const appId = kintone.app.getId();
      const deviceDiv = isPcViewMode ? DeviceDiv.desktop : DeviceDiv.mobile;
      const isGuestSpace = kintone.getLoginUser().isGuest;

      // 取得したアプリIDの確認（※利用できない画面の場合、nullになる為）
      if (appId === null) {
        // トーストでエラーメッセージ表示
        showToast(`${ErrorMessage.E_MSG003}（${ErrorCode.E00001}）`, 0, false);
        return;
      }

      // 最新JSの取得（from kintone）
      const { jsCodeForKintone } = await getKintoneCustomizeJs(appId, deviceDiv, isGuestSpace);
      setCode(jsCodeForKintone);
      setCodeLatest(jsCodeForKintone);
      setIsChangeCode(false);
      setDockState(dockState => ({ ...dockState, codeEditorVisible: true }));
    } catch (err) {
      // トーストでエラーメッセージ表示
      showToast(`${ErrorMessage.E_MSG001}（${ErrorCode.E99999}）`, 0, false);
    }
  }

  useEffect(() => {
    if (dockState.codeEditorVisible) {
      if (!codeLatest) {
        // 最新JSが未取得の場合、取得して表示
        getLatestCode();
      }
    }
  }, [dockState.codeEditorVisible]);

  useEffect(() => {
    // 編集中フラグ(Ref)の更新
    if (isChangeCodeRef) {
      isChangeCodeRef.current = isChangeCode;
    }
  }, [isChangeCode]);

  const handleBeforeunload = (event: BeforeUnloadEvent) => {
    // コードエディタのコードが編集されていたら、確認モーダルを表示
    if (isChangeCodeRef && isChangeCodeRef.current) {
      event.preventDefault();
      event.returnValue = "";
    }
  };

  useBeforeunload(handleBeforeunload);

  return {
    copySuccess,
    isFullScreen,
    code,
    setCodeLatest,
    setIsChangeCode,
    isCodeActionDialog,
    setIsCodeActionDialog,
    dialogType,
    setDialogType,
    handleCodeEditorClick,
    handleRunCodeAction,
    handleCodeChange,
    toggleFullScreen,
    copyToClipboard,
    handleRefreshClick,
  };
};

