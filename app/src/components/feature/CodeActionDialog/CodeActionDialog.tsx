// src/components/feature/CodeActionDialog/CodeActionDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { sCodeActionDialog, sCodeActionDialogOverlay } from "./CodeActionDialog.css";
import { useCodeActionDialogLogic } from "./useCodeActionDialogLogic";

const CodeActionDialog = () => {
  const {
    content,
    isCodeActionDialog,
    setIsCodeActionDialog,
    preventCloseOnEsc,
  } = useCodeActionDialogLogic();

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
