// components/ui/Loading/DonutLoading/DonutLoading.stories.tsx
import { Button, Flex } from "@radix-ui/themes";
import { vars } from "~/styles/theme.css";
import { useLoadingLogic } from "../useLoadingLogic";
import DonutLoading from "./DonutLoading";

export default {
  title: 'UI/Lodiing/DonutLoading',
  component: DonutLoading,
};

export const Default = () => {
  const { isLoading, startLoading, stopLoading } = useLoadingLogic(false);

  return (
    <Flex
      gap={'8'}
    >
      <Flex
        justify={'center'}
        align={'center'}
        gap={'4'}
      >
        <DonutLoading
          isLoading={isLoading}
        />
        <DonutLoading
          isLoading={isLoading}
          borderColor={`${vars.color.crimson.crimson10} ${vars.color.crimson.crimson6} ${vars.color.crimson.crimson6}`}
        />
        <Button onClick={startLoading}>Start Loading</Button>
        <Button onClick={stopLoading}>Stop Loading</Button>
      </Flex>
    </Flex>
  );
}
