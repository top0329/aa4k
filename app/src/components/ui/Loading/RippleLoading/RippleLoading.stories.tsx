// components/ui/Loading/RippleLoading/RippleLoading.stories.tsx
import { Button, Flex } from "@radix-ui/themes";
import { useLoadingLogic } from "../useLoadingLogic";
import RippleLoading from "./RippleLoading";

export default {
  title: 'UI/Lodiing/RippleLoading',
  component: RippleLoading,
};

export const Default = () => {
  const { isLoading, startLoading, stopLoading } = useLoadingLogic(false);

  return (
    <Flex
      justify={'center'}
      align={'center'}
      gap={'4'}
    >
      <RippleLoading
        isLoading={isLoading}
      />
      <Button onClick={startLoading}>Start Loading</Button>
      <Button onClick={stopLoading}>Stop Loading</Button>
    </Flex>
  );
}
