// src/components/feature/CodeEditor/useCodeEditorLogic.tsx
import { useAtom } from 'jotai';
import { useState, useEffect } from 'react';
import { DockItemVisibleState } from '~/components/feature/Dock/DockState';
import { ViewModeState } from '../CornerDialog/CornerDialogState';
import { CodeState, CodeLatestState, IsChangeCodeState } from "~/components/feature/CodeEditor/CodeEditorState";
import { useCodeCheckLogic } from "~/components/feature/CodeActionDialog/useCodeCheckLogic";
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { codeActionDialogTypeState, isCodeActionDialogState, codeCheckStatusState } from '../CodeActionDialog/CodeActionDialogState';
import { DeviceDiv, CodeActionDialogType, CodeCheckStatus, ErrorCode, InfoMessage, ErrorMessage } from "~/constants";
import { getKintoneCustomizeJs } from "~/util/kintoneCustomize";

export const useCodeEditorLogic = () => {
  const [isPcViewMode] = useAtom(ViewModeState);
  const [code, setCode] = useAtom(CodeState);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [dockState, setDockState] = useAtom(DockItemVisibleState);
  const [, setIsCodeActionDialog] = useAtom(isCodeActionDialogState);
  const [, setDialogType] = useAtom(codeActionDialogTypeState);
  const [codeLatest, setCodeLatest] = useAtom(CodeLatestState);
  const [isChangeCode, setIsChangeCode] = useAtom(IsChangeCodeState);
  const [, setCodeCheckStatus] = useAtom(codeCheckStatusState);

  const { copyToClipboard, copySuccess } = useCopyToClipboard();
  const { executeCodeCheck } = useCodeCheckLogic();

  const handleCodeEditorClick = async () => {
    if (dockState.codeEditorVisible) {
      setDockState(dockState => ({ ...dockState, codeEditorVisible: !dockState.codeEditorVisible }));
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
    if (type === CodeActionDialogType.CodeCheck) {
      setCodeCheckStatus(CodeCheckStatus.loading);
      // コードチェック実行
      executeCodeCheck();
    }
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
        // TODO: トーストでエラーメッセージ表示に差し替え予定
        alert(`${ErrorMessage.E_MSG003}（${ErrorCode.E00001}）`);
        return;
      }
  
      // 最新JSの取得（from kintone）
      const { jsCodeForKintone } = await getKintoneCustomizeJs(appId, deviceDiv, isGuestSpace);
      setCode(jsCodeForKintone);
      setCodeLatest(jsCodeForKintone);
      setIsChangeCode(false);
      setDockState(dockState => ({ ...dockState, codeEditorVisible: true }));
    } catch (err) {
      // TODO: トーストでエラーメッセージ表示に差し替え予定
      alert(`${ErrorMessage.E_MSG001}（${ErrorCode.E99999}）`);
    }
  }

  useEffect(() => {
    if (dockState.codeEditorVisible) {
      if (!codeLatest) {
        // 最新JSが未取得の場合、取得して表示
        getLatestCode();
      }
    } else {
      if (isChangeCode) {
        // コードエディタのコードが編集されていたら、確認モーダルを表示
        if (!window.confirm(InfoMessage.I_MSG002)) {
          setDockState(dockState => ({ ...dockState, dialogVisible: true, codeEditorVisible: true }));
        }
      }
    }
  }, [dockState.codeEditorVisible]);

  return {
    code,
    copySuccess,
    isFullScreen,
    setCode,
    handleCodeEditorClick,
    handleRunCodeAction,
    handleCodeChange,
    toggleFullScreen,
    copyToClipboard,
    handleRefreshClick,
  };
};

