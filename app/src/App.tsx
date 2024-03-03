// src/App.tsx
import { useAtom } from "jotai";
import CodeActionDialog from "./components/feature/CodeActionDialog/CodeActionDialog";
import { isCodeActionDialogState } from "./components/feature/CodeActionDialog/CodeActionDialogState";
import CornerDialog from "./components/feature/CornerDialog/CornerDialog";
import { ErrorToastProvider } from "./components/ui/ErrorToast/ErrorToastProvider";
import { PluginIdState } from "./state/pluginIdState";

const App = ({ pluginId }: { pluginId: string }) => {
  const [, setPluginId] = useAtom(PluginIdState);
  setPluginId(pluginId);
  const [isCodeActionDialog] = useAtom(isCodeActionDialogState);
  return (
    <ErrorToastProvider>
      {isCodeActionDialog && <CodeActionDialog />}
      <CornerDialog />
    </ErrorToastProvider>
  );
}
export default App;
