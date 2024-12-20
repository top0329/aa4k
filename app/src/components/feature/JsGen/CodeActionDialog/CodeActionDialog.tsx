// src/components/feature/JsGen/CodeActionDialog/CodeActionDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { Box } from "@radix-ui/themes";
import clsx from "clsx";
import { CodeActionDialogType, CodeCheckStatus } from "~/constants";
import { CodeActionDialogProps } from "~/types/codeActionDialogTypes";
import { sCodeActionDialog, sCodeActionDialogOverlay } from "./CodeActionDialog.css";
import CodeCheck from './CodeCheck';
import CodeFix from './CodeFix';
import { useCodeActionDialogLogic } from "./useCodeActionDialogLogic";

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
          isLoading={isLoading}
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
    <Dialog.Root open={isCodeActionDialog} onOpenChange={setIsCodeActionDialog}
      modal={false}
    >
      {isCodeActionDialog && <Box className={sCodeActionDialogOverlay} />}
      <Dialog.Content className={clsx(sCodeActionDialog, 'allow-zoom')}
        onPointerDownOutside={(event) => event.preventDefault()}
        onKeyDown={preventCloseOnEsc}
        onInteractOutside={(event) => event.preventDefault()}
      >
        {content}
      </Dialog.Content>
    </Dialog.Root >

  );
}

export default CodeActionDialog;
