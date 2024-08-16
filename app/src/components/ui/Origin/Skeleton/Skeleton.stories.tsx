// components/ui/Button/Button.stories.tsx
import { Box, Button } from "@radix-ui/themes";
import { useState } from "react";
import ChatSkeleton from "./ChatSkeleton";
import DockSkeleton from "./DockSkeleton";

export default {
  title: 'UI/Skeleton',
  component: [DockSkeleton, ChatSkeleton],
};

export const Dock = () => {
  const [isVisible, setVisible] = useState(false);

  return (<Box>
    <Button onClick={() => setVisible(!isVisible)}>Toggle</Button>
    {
      isVisible &&
      <Box style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        padding: 0,
      }}><DockSkeleton /></Box>
    }
  </Box>
  )
}

export const Chat = () => {
  const [isVisible, setVisible] = useState(false);

  return (<Box>
    <Button onClick={() => setVisible(!isVisible)}>Toggle</Button>
    {
      isVisible &&
      <Box style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        padding: 0,
      }}><ChatSkeleton /></Box>
    }
  </Box>
  )
}
