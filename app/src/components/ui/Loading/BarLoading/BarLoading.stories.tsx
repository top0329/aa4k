// components/ui/Loading/BarLoading/BarLoading.stories.tsx
import { Box, Button, Flex } from "@radix-ui/themes";
import { useState } from 'react';
import Dock from "~/components/feature/Dock/Dock";
import { useLoadingLogic } from "../useLoadingLogic";
import BarLoading from "./BarLoading";

export default {
  title: 'UI/Lodiing/BarLoading',
  component: BarLoading,
};

export const Default = () => {
  const { isLoading, startLoading, stopLoading } = useLoadingLogic(false);
  const [, setHumanMessage] = useState("");

  return (
    <Box style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <Flex
        gap={'4'}
      >
        <Button onClick={startLoading}>Start Loading</Button>
        <Button onClick={stopLoading}>Stop Loading</Button>
      </Flex>
      <BarLoading isLoading={isLoading} />
      <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Dock setHumanMessage={setHumanMessage} />

      </Box>
    </Box>
  );
}
