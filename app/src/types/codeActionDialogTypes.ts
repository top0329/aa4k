import { CodeActionDialogType } from "~/constants";

export type CodeActionDialogProps = {
  code: string;
  setCodeLatest: React.Dispatch<React.SetStateAction<string>>;
  setIsChangeCode: React.Dispatch<React.SetStateAction<boolean>>;
  isCodeActionDialog: boolean;
  setIsCodeActionDialog: React.Dispatch<React.SetStateAction<boolean>>;
  dialogType: CodeActionDialogType;
  setDialogType: React.Dispatch<React.SetStateAction<CodeActionDialogType>>;
};
