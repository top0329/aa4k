// src/componetns/feature/CornerDialog/CornerDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { Box } from "@radix-ui/themes";
import ScrollToBottom from "react-scroll-to-bottom";
import Dock from "~/components/feature/Dock/Dock.tsx";
import "~/styles/scrollbar.css";
import { vars } from "~/styles/theme.css.ts";
import AccordionHistory from "../AccordionHistory/AccordionHistory.tsx";
import CodeEditor from "../CodeEditor/CodeEditor.tsx";
import PromptForm from "../PromptForm/PromptForm.tsx";
import { DialogChat, DialogOverlay } from "./CornerDialog.css";
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
          <Box className={DialogChat} >
            <ScrollToBottom
              className="w-100"
              scrollViewClassName="scrollbar">
              <Box style={{
                background: 'white'
              }}>
                <AccordionHistory />
              </Box>

              <Box p={'5'}
                width={'100%'}
                style={{
                  background: vars.color.indigoA.indigoA2
                }}>
                <PromptForm />
              </Box>
            </ScrollToBottom>
          </Box>
        )}
        <Dock />
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CornerDialog;
