// src/components/feature/CodeActionDialog/useCodeActionDialogLogic.tsx
import { useAtom } from 'jotai';
import { CodeActionDialogType } from '~/types/codeActionTypes';
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

  const content = <CodeActionDialogContent dialogType={dialogType} />

  // ESCキーでダイアログが閉じるのを無効化する
  const preventCloseOnEsc = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
    }
  };

  return {
    codeViolations,
    codeCheckStatus,
    setCodeCheckStatus,
    dialogType,
    setDialogType,
    isCodeActionDialog,
    setIsCodeActionDialog,
    content,
    preventCloseOnEsc,
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
