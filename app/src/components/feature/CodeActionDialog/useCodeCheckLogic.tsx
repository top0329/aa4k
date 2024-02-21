// src/components/feature/CodeActionDialog/useCodeCheckLogic.tsx
import { useAtom } from 'jotai';
import { codeCheck } from '~/ai/codeCheck';
import { preCheck } from '~/util/preCheck';
import { CodeState } from '~/components/feature/CodeEditor/CodeEditorState';
import { isCodeActionDialogState, codeCheckStatusState, codeViolationsState } from './CodeActionDialogState';
import { CodeCheckStatus, ErrorCode, ErrorMessage } from "~/constants";

export const useCodeCheckLogic = () => {
  const [, setIsCodeActionDialog] = useAtom(isCodeActionDialogState);
  const [, setCodeCheckStatus] = useAtom(codeCheckStatusState);
  const [, setCodeViolations] = useAtom(codeViolationsState);
  const [code] = useAtom(CodeState);

  // コードチェック実行
  const executeCodeCheck = async () => {
    try {
      // 事前チェックの呼び出し
      const { preCheckResult, resStatus: resPreCheckStatus } = await preCheck();
      if (resPreCheckStatus !== 200) {
        setIsCodeActionDialog(false);
        // TODO: トーストでエラーメッセージ表示に差し替え予定
        const errorMessage = preCheckResult.errorCode === ErrorCode.A02002
          ? `${ErrorMessage.E_MSG002}（${preCheckResult.errorCode}）`
          : `${ErrorMessage.E_MSG001}（${preCheckResult.errorCode}）`;
        alert(errorMessage);
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
      // TODO: トーストでエラーメッセージ表示に差し替え予定
      alert(`${ErrorMessage.E_MSG001}（${ErrorCode.E99999}）`);
    }
  }

  return {
    executeCodeCheck,
  }
}