// src/components/feature/CodeActionDialog/useCodeActionDialogLogic.tsx
import { useAtom } from 'jotai';
import { CodeLatestState, CodeState, IsChangeCodeState } from '~/components/feature/CodeEditor/CodeEditorState';
import { ViewModeState } from '~/components/feature/CornerDialog/CornerDialogState';
import { useLoadingLogic } from '~/components/ui/Loading/useLoadingLogic';
import { CodeActionDialogType, DeviceDiv, ErrorCode, ErrorMessage } from "~/constants";
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
  const [codeViolations] = useAtom(codeViolationsState);
  const [isPcViewMode] = useAtom(ViewModeState);
  const [code] = useAtom(CodeState);
  const [, setCodeLatest] = useAtom(CodeLatestState);
  const [, setIsChangeCode] = useAtom(IsChangeCodeState);
  const { isLoading,
    startLoading,
    stopLoading
  } = useLoadingLogic(false);

  const content = <CodeActionDialogContent dialogType={dialogType} />

  // ESCキーでダイアログが閉じるのを無効化する
  const preventCloseOnEsc = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
    }
  };

  const handleReflectClick = async () => {
    await startLoading();
    try {
      const appId = kintone.app.getId();
      const deviceDiv = isPcViewMode ? DeviceDiv.desktop : DeviceDiv.mobile;
      const isGuestSpace = kintone.getLoginUser().isGuest;

      // 取得したアプリIDの確認（※利用できない画面の場合、nullになる為）
      if (appId === null) {
        setIsCodeActionDialog(false);
        // TODO: トーストでエラーメッセージ表示に差し替え予定
        alert(`${ErrorMessage.E_MSG003}（${ErrorCode.E00001}）`);
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
      // TODO: トーストでエラーメッセージ表示に差し替え予定
      alert(`${ErrorMessage.E_MSG001}（${ErrorCode.E99999}）`);
    }
    await stopLoading();
  }

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

const CodeActionDialogContent = ({ dialogType }: { dialogType: CodeActionDialogType }) => {
  switch (dialogType) {
    case CodeActionDialogType.CodeCheck:
      return <CodeCheck />;
    case CodeActionDialogType.CodeFix:
      return <CodeFix />;
    default:
      const unexpected: never = dialogType
      throw Error("想定されていないdialogTypeです. dialogType=", unexpected)
  }
}
