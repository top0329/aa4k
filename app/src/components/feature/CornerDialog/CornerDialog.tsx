// src/componetns/feature/CornerDialog/CornerDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";
import { Box, Button } from "@radix-ui/themes";
import ScrollToBottom from "react-scroll-to-bottom";
import { Form } from "~/components/forms/Form/Form.tsx";
import "~/styles/scrollbar.css";
import { vars } from "~/styles/theme.css.ts";
import AccordionHistory from "../AccordionHistory/AccordionHistory.tsx";
import { Dock } from "../Dock";
import { DialogContent, DialogOverlay } from "./CornerDialog.css";
import { useCornerDialogLogic } from "./useCornerDialogLogic.tsx";

const CornerDialog = () => {
  const {
    chatOpen, dialogOpen, setDialogOpen,
    onSubmit, conversations } = useCornerDialogLogic();

  return (
    <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
      <Dialog.Trigger>
        <Button>Open</Button>
      </Dialog.Trigger>
      <Dialog.Overlay className={DialogOverlay} />
      <Dialog.Content className={DialogContent} onPointerDownOutside={(e) => e.preventDefault()}>
        {chatOpen && (
          <ScrollToBottom scrollViewClassName="scrollbar">
            <Box style={{
              background: 'white'
            }}>
              <AccordionHistory conversations={conversations} />
            </Box>

            <Box p={'5'} style={{
              background: vars.color.indigoA.indigoA2
            }}>
              <Form onSubmit={onSubmit} />
            </Box>
          </ScrollToBottom>
        )}
        <Dock />
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default CornerDialog;
