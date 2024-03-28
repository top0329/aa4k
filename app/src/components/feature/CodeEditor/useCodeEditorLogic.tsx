// src/components/feature/CodeEditor/useCodeEditorLogic.tsx
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useToast } from "~/components/ui/ErrorToast/ErrorToastProvider";
import { CodeActionDialogType, DeviceDiv, ErrorCode, ErrorMessage, InfoMessage } from "~/constants";
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useCodeAction } from "~/hooks/useCodeAction";
import { DesktopIsChangeCodeState, MobileIsChangeCodeState } from '~/state/codeActionState';
import { DockItemVisibleState } from '~/state/dockItemState';
import { ViewModeState } from '~/state/viewModeState';
import { getKintoneCustomizeJs } from "~/util/kintoneCustomize";
import { KintoneError } from "~/util/customErrors"

export const useCodeEditorLogic = (
  isChangeCodeRef?: React.MutableRefObject<boolean>
) => {
  const [isPcViewMode] = useAtom(ViewModeState);
  const {
    code,
    setCode,
    codeLatest,
    setCodeLatest,
    isChangeCode,
    setIsChangeCode,
    isInitialCode,
    setIsInitialCode,
  } = useCodeAction(isPcViewMode);
  const [isDesktopChangeCode] = useAtom(DesktopIsChangeCodeState);
  const [isMobileChangeCode] = useAtom(MobileIsChangeCodeState);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [dockState] = useAtom(DockItemVisibleState);
  const [isCodeActionDialog, setIsCodeActionDialog] = useState(false);
  const [dialogType, setDialogType] = useState<CodeActionDialogType>("codeCheck");

  const { copyToClipboard, copySuccess } = useCopyToClipboard();
  const { showToast } = useToast();

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
      setIsInitialCode(true);
    } catch (err) {
      if (err instanceof KintoneError) {
        // トーストでエラーメッセージ表示
        showToast(err.message, 0, false)
      } else {
        // トーストでエラーメッセージ表示
        showToast(`${ErrorMessage.E_MSG001}（${ErrorCode.E99999}）`, 0, false);
      }
    }
  }

  useEffect(() => {
    if (dockState.codeEditorVisible) {
      if (!isInitialCode) {
        // 最新JSが未取得の場合、取得して表示
        getLatestCode();
      }
    }
  }, [dockState.codeEditorVisible, isPcViewMode]);

  useEffect(() => {
    // 編集中フラグ(Ref)の更新
    if (isChangeCodeRef) {
      isChangeCodeRef.current = isDesktopChangeCode || isMobileChangeCode ? true : false;
    }
  }, [isDesktopChangeCode, isMobileChangeCode]);

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
    handleRunCodeAction,
    handleCodeChange,
    toggleFullScreen,
    copyToClipboard,
    handleRefreshClick,
  };
};

