// components/ui/Button/Button.stories.tsx
import { Box, Button } from "@radix-ui/themes";
import { useState } from "react";
import DockSkeleton from "./Skeleton";

export default {
  title: 'UI/Skeleton',
  component: DockSkeleton,
};

export const Default = () => {
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
