// src/components/feature/CodeActionDialog/CodeActionDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import CodeCheck from './CodeCheck';
import CodeFix from './CodeFix';
import { sCodeActionDialog, sCodeActionDialogOverlay } from "./CodeActionDialog.css";
import { useCodeActionDialogLogic } from "./useCodeActionDialogLogic";
import { CodeActionDialogType, CodeCheckStatus } from "~/constants";
import { CodeActionDialogProps } from "~/types/codeActionDialogTypes";

const CodeActionDialog: React.FC<CodeActionDialogProps> = (
  props
) => {
  const {
    isCodeActionDialog,
    setIsCodeActionDialog,
    dialogType,
  } = props;
  const {
    isLoading,
    codeViolations,
    codeCheckStatus,
    preventCloseOnEsc,
    handleReflectClick,
  } = useCodeActionDialogLogic(props);

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

  return (
    <Dialog.Root open={isCodeActionDialog} onOpenChange={setIsCodeActionDialog}>
      <Dialog.Overlay className={sCodeActionDialogOverlay} />
      <Dialog.Content className={sCodeActionDialog}
        onPointerDownOutside={(event) => event.preventDefault()}
        onKeyDown={preventCloseOnEsc}
      >
        {content}
      </Dialog.Content>
    </Dialog.Root >

  );
}

export default CodeActionDialog;
