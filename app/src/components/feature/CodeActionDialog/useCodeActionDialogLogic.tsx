// src/components/feature/CodeActionDialog/useCodeActionDialogLogic.tsx
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { codeCheck } from '~/ai/codeCheck';
import { preCheck } from '~/util/preCheck';
import { CodeLatestState, CodeState, IsChangeCodeState } from '~/components/feature/CodeEditor/CodeEditorState';
import { ViewModeState, PluginIdState } from '~/components/feature/CornerDialog/CornerDialogState';
import { useLoadingLogic } from '~/components/ui/Loading/useLoadingLogic';
import { useToast } from "~/components/ui/ErrorToast/ErrorToastProvider";
import { CodeCheckStatus, CodeActionDialogType, DeviceDiv, ErrorCode, ErrorMessage } from "~/constants";
import { getKintoneCustomizeJs, updateKintoneCustomizeJs } from '~/util/kintoneCustomize';
import { codeActionDialogTypeState, codeCheckStatusState, codeViolationsState, isCodeActionDialogState } from './CodeActionDialogState';
import CodeCheck from './CodeCheck';
import CodeFix from './CodeFix';

export const useCodeActionDialogLogic = () => {
  const [
    dialogType,
    setDialogType,
  ] = useAtom(codeActionDialogTypeState);
  const [isCodeActionDialog, setIsCodeActionDialog] = useAtom(isCodeActionDialogState);
  const [
    codeCheckStatus,
    setCodeCheckStatus,
  ] = useAtom(codeCheckStatusState);
  const [codeViolations, setCodeViolations] = useAtom(codeViolationsState);
  const [isPcViewMode] = useAtom(ViewModeState);
  const [pluginId] = useAtom(PluginIdState);
  const [code] = useAtom(CodeState);
  const [, setCodeLatest] = useAtom(CodeLatestState);
  const [, setIsChangeCode] = useAtom(IsChangeCodeState);
  const { isLoading,
    startLoading,
    stopLoading
  } = useLoadingLogic(false);
  const { showToast } = useToast();

  // ESCキーでダイアログが閉じるのを無効化する
  const preventCloseOnEsc = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
    }
  };

  // 反映ボタン押下時の処理
  const handleReflectClick = async () => {
    try {
      const appId = kintone.app.getId();
      const deviceDiv = isPcViewMode ? DeviceDiv.desktop : DeviceDiv.mobile;
      const isGuestSpace = kintone.getLoginUser().isGuest;

      // 取得したアプリIDの確認（※利用できない画面の場合、nullになる為）
      if (appId === null) {
        setIsCodeActionDialog(false);
        // トーストでエラーメッセージ表示
        showToast(`${ErrorMessage.E_MSG003}（${ErrorCode.E00001}）`, 0, false);
        return;
      }

      // --------------------
      // 最新JSの取得（from kintone）
      // --------------------
      const { kintoneCustomizeFiles, targetFileKey } = await getKintoneCustomizeJs(appId, deviceDiv, isGuestSpace);

      // --------------------
      // kintoneカスタマイズへの反映
      // --------------------
      await updateKintoneCustomizeJs(code, targetFileKey, kintoneCustomizeFiles, appId, deviceDiv, isGuestSpace);

      setIsCodeActionDialog(false);
      setCodeLatest(code);
      setIsChangeCode(false);

      // テスト環境へ遷移
      location.href = `/k/admin/preview/${appId}/`;
    } catch (err) {
      setIsCodeActionDialog(false);
      // トーストでエラーメッセージ表示
      showToast(`${ErrorMessage.E_MSG001}（${ErrorCode.E99999}）`, 0, false);
    }
  }

  // コードチェック実行
  const executeCodeCheck = async () => {
    await startLoading();
    try {
      setCodeCheckStatus(CodeCheckStatus.loading);
      // 事前チェックの呼び出し
      const { preCheckResult, resStatus: resPreCheckStatus } = await preCheck(pluginId);
      if (resPreCheckStatus !== 200) {
        setIsCodeActionDialog(false);
        // トーストでエラーメッセージ表示
        const errorMessage = preCheckResult.errorCode === ErrorCode.A02002
          ? `${ErrorMessage.E_MSG002}（${preCheckResult.errorCode}）`
          : `${ErrorMessage.E_MSG001}（${preCheckResult.errorCode}）`;
        showToast(errorMessage, 0, false);
        return;
      }
      const contractStatus = preCheckResult.contractStatus;

      // コードチェックの呼び出し
      const resCodeCheck = await codeCheck(code, contractStatus);

      switch (resCodeCheck.result) {
        case CodeCheckStatus.safe:
          setCodeCheckStatus(resCodeCheck.result);
          break;
        case CodeCheckStatus.caution:
          const violations = resCodeCheck.message.split('\n');
          setCodeCheckStatus(resCodeCheck.result);
          setCodeViolations(violations);
          break;
        case CodeCheckStatus.loading:
          // コードチェック結果としてはloadingは返却されない想定の為、エラーとする
          throw Error(`想定されていないcodeCheckStatusです。codeCheckStatus=${resCodeCheck.result}`);
        default:
          const unexpected: never = resCodeCheck.result;
          throw Error(`想定されていないcodeCheckStatusです。codeCheckStatus=${unexpected}`);
      }
    } catch (err) {
      setIsCodeActionDialog(false);
      // トーストでエラーメッセージ表示
      showToast(`${ErrorMessage.E_MSG001}（${ErrorCode.E99999}）`, 0, false);
    }
    await stopLoading();
  }

  useEffect(() => {
    if (isCodeActionDialog && dialogType === CodeActionDialogType.CodeCheck) {
      // コードチェック実行
      executeCodeCheck();
    }
  }, [isCodeActionDialog]);

  const content = (
    <CodeActionDialogContent
      dialogType={dialogType}
      isLoading={isLoading}
      codeCheckStatus={codeCheckStatus}
      setIsCodeActionDialog={setIsCodeActionDialog}
      codeViolations={codeViolations}
      handleReflectClick={handleReflectClick}
    />
  );

  return {
    isLoading,
    codeViolations,
    codeCheckStatus,
    setCodeCheckStatus,
    dialogType,
    setDialogType,
    isCodeActionDialog,
    setIsCodeActionDialog,
    content,
    preventCloseOnEsc,
    handleReflectClick,
  };
};

type CodeActionDialogContentProps = {
  dialogType: CodeActionDialogType;
  isLoading: boolean;
  codeCheckStatus: CodeCheckStatus;
  setIsCodeActionDialog: React.Dispatch<React.SetStateAction<boolean>>;
  codeViolations: string[];
  handleReflectClick: () => Promise<void>;
};

const CodeActionDialogContent = ({ dialogType, isLoading, codeCheckStatus, setIsCodeActionDialog, codeViolations, handleReflectClick }: CodeActionDialogContentProps) => {
  switch (dialogType) {
    case CodeActionDialogType.CodeCheck:
      return (<CodeCheck
                isLoading={isLoading}
                codeCheckStatus={codeCheckStatus}
                setIsCodeActionDialog={setIsCodeActionDialog}
                codeViolations={codeViolations}
              />);
    case CodeActionDialogType.CodeFix:
      return (<CodeFix
                setIsCodeActionDialog={setIsCodeActionDialog}
                handleReflectClick={handleReflectClick}
              />);
    default:
      const unexpected: never = dialogType
      throw Error("想定されていないdialogTypeです. dialogType=", unexpected)
  }
}
