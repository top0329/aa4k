// src/App.tsx
import { Box } from "@radix-ui/themes";
import { useAtom } from "jotai";
import CornerDialog from "./components/feature/CornerDialog/CornerDialog";
import { ErrorToastProvider } from "./components/ui/ErrorToast/ErrorToastProvider";
import { PluginIdState } from "./state/pluginIdState";

const App = ({ pluginId }: { pluginId: string }) => {
  const [, setPluginId] = useAtom(PluginIdState);
  setPluginId(pluginId);

  return (
    <ErrorToastProvider>
      <Box
        style={{
          width: '100vw',
          height: '200vh',
          position: 'relative',
        }}
      >
        <CornerDialog />
      </Box>
    </ErrorToastProvider>
  );
}
export default App;
