// src/components/feature/CodeActionDialog/useCodeActionDialogLogic.tsx
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { codeCheck } from '~/ai/codeCheck';
import { useToast } from "~/components/ui/ErrorToast/ErrorToastProvider";
import { useLoadingLogic } from '~/components/ui/Loading/useLoadingLogic';
import { CodeActionDialogType, CodeCheckStatus, DeviceDiv, ErrorCode, ErrorMessage } from "~/constants";
import { PluginIdState } from '~/state/pluginIdState';
import { ReloadState } from "~/state/reloadState";
import { ViewModeState } from '~/state/viewModeState';
import { CodeActionDialogProps } from "~/types/codeActionDialogTypes";
import { getKintoneCustomizeJs, updateKintoneCustomizeJs } from '~/util/kintoneCustomize';
import { preCheck } from '~/util/preCheck';
import { getApiErrorMessage } from '~/util/getErrorMessage';
import { KintoneError } from "~/util/customErrors"

export const useCodeActionDialogLogic = (props: CodeActionDialogProps) => {
  const [codeCheckStatus, setCodeCheckStatus] = useState<CodeCheckStatus>(CodeCheckStatus.loading);
  const [codeViolations, setCodeViolations] = useState<string[]>([]);
  const [isPcViewMode] = useAtom(ViewModeState);
  const [pluginId] = useAtom(PluginIdState);
  const [, setIsReload] = useAtom(ReloadState);

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
        props.setIsCodeActionDialog(false);
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
      await updateKintoneCustomizeJs(props.code, targetFileKey, kintoneCustomizeFiles, appId, deviceDiv, isGuestSpace);

      props.setIsCodeActionDialog(false);
      props.setCodeLatest(props.code);
      props.setIsChangeCode(false);
      setIsReload(true);

      // 画面再読み込み
      location.reload()
    } catch (err) {
      props.setIsCodeActionDialog(false);
      if (err instanceof KintoneError) {
        // トーストでエラーメッセージ表示
        showToast(err.message, 0, false)
      } else {
        // トーストでエラーメッセージ表示
        showToast(`${ErrorMessage.E_MSG001}（${ErrorCode.E99999}）`, 0, false);
      }
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
        props.setIsCodeActionDialog(false);
        // APIエラー時のエラーメッセージを取得
        const errorMessage = getApiErrorMessage(resPreCheckStatus, preCheckResult.errorCode);
        // トーストでエラーメッセージ表示
        showToast(errorMessage, 0, false);
        return;
      }
      const contractStatus = preCheckResult.contractStatus;
      const appId = kintone.app.getId();
      const userId = kintone.getLoginUser().id;

      // 取得したアプリIDの確認（※利用できない画面の場合、nullになる為）
      if (appId === null) {
        props.setIsCodeActionDialog(false);
        // トーストでエラーメッセージ表示
        showToast(`${ErrorMessage.E_MSG003}（${ErrorCode.E00001}）`, 0, false);
        return;
      }
      // コードチェックの呼び出し
      const resCodeCheck = await codeCheck(props.code, pluginId, contractStatus, appId, userId);

      switch (resCodeCheck.result) {
        case CodeCheckStatus.safe:
          setCodeCheckStatus(resCodeCheck.result);
          break;
        case CodeCheckStatus.caution:
          const violations = resCodeCheck.message;
          setCodeCheckStatus(resCodeCheck.result);
          setCodeViolations(violations);
          break;
        case CodeCheckStatus.error:
          props.setIsCodeActionDialog(false);
          // トーストでエラーメッセージ表示
          showToast(resCodeCheck.message[0], 0, false);
          break;
        case CodeCheckStatus.loading:
          // コードチェック結果としてはloadingは返却されない想定の為、エラーとする
          throw Error(`想定されていないcodeCheckStatusです。codeCheckStatus=${resCodeCheck.result}`);
        default:
          const unexpected: never = resCodeCheck.result;
          throw Error(`想定されていないcodeCheckStatusです。codeCheckStatus=${unexpected}`);
      }
    } catch (err) {
      props.setIsCodeActionDialog(false);
      if (err instanceof KintoneError) {
        // トーストでエラーメッセージ表示
        showToast(err.message, 0, false)
      } else {
        // トーストでエラーメッセージ表示
        showToast(`${ErrorMessage.E_MSG001}（${ErrorCode.E99999}）`, 0, false);
      }
    }
    await stopLoading();
  }

  useEffect(() => {
    if (props.isCodeActionDialog && props.dialogType === CodeActionDialogType.CodeCheck) {
      // コードチェック実行
      executeCodeCheck();
    }
  }, [props.isCodeActionDialog]);

  return {
    isLoading,
    codeViolations,
    codeCheckStatus,
    setCodeCheckStatus,
    preventCloseOnEsc,
    handleReflectClick,
  };
};
