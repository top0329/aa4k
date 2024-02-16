// src/App.tsx
import { Box } from "@radix-ui/themes";
import { useAtom } from "jotai";
import CodeActionDialog from "./components/feature/CodeActionDialog/CodeActionDialog";
import { isCodeActionDialogState } from "./components/feature/CodeActionDialog/CodeActionDialogState";
import CornerDialog from "./components/feature/CornerDialog/CornerDialog";

const App = () => {
  const [isCodeActionDialog] = useAtom(isCodeActionDialogState);
  return (
    <Box>
      {isCodeActionDialog && <CodeActionDialog />}
      <CornerDialog />
    </Box>
  );
}
export default App;
