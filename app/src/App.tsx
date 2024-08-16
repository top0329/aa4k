// src/App.tsx
import { useAtom } from "jotai";
import CornerDialog from "./components/feature/Common/CornerDialog/CornerDialog";
import { ErrorToastProvider } from "./components/ui/Origin/ErrorToast/ErrorToastProvider";
import { PluginIdState } from "./state/pluginIdState";

const App = ({ pluginId }: { pluginId: string }) => {
  const [, setPluginId] = useAtom(PluginIdState);
  setPluginId(pluginId);

  return (
    <ErrorToastProvider>
      <CornerDialog />
    </ErrorToastProvider>
  );
}
export default App;
