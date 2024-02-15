// src/componetns/feature/CornerDialog/CornerDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import Dock from "~/components/feature/Dock/Dock.tsx";
import "~/styles/scrollbar.css";
import Chat from "../Chat/Chat.tsx";
import CodeEditor from "../CodeEditor/CodeEditor.tsx";
import { DialogOverlay } from "./CornerDialog.css";
import { useCornerDialogLogic } from "./useCornerDialogLogic.tsx";

const CornerDialog = () => {
  const { dockState, handleBannerClick, isBannerClicked } = useCornerDialogLogic();

  return (
    <Dialog.Root open={dockState.dialogVisible}>
      <Dialog.Trigger onClick={handleBannerClick} disabled={isBannerClicked}>
        Open
      </Dialog.Trigger>
      <Dialog.Overlay className={DialogOverlay} />
      <Dialog.Content onPointerDownOutside={(e) => e.preventDefault()}>

        {dockState.codeEditorVisible && (
          <CodeEditor />
        )}

        {dockState.chatVisible && (
          <Chat />
        )}
        <Dock />
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CornerDialog;
