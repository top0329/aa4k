// src/components/feature/CodeActionDialog/CodeFix.tsx
import { Button, Flex, Text } from "@radix-ui/themes";
import { useCodeActionDialogLogic } from "./useCodeActionDialogLogic";

const CodeFix = () => {
  const { setIsCodeActionDialog } = useCodeActionDialogLogic();

  return (<>
    <Flex
      align={'center'}
      justify={'center'}
    >
      <Text size={'3'} weight={'bold'} color='gray'>
        編集したコードをテスト確認しますか？
      </Text>
    </Flex>
    <Flex
      direction={'column'}
      py={'4'}
      gap={'1'}
    >
      <Text size={'1'} color='gray'>
        反映ボタンを押すと、テスト環境へ遷移します
      </Text>
      <Text size={'1'} color='gray'>
        ※編集したコードはアプリ設定からアプリの更新を行うことで反映されます
      </Text>
    </Flex>
    <Flex
      width={'100%'}
      pt={'5'}
      align={'center'}
      justify={'between'}
      style={{
        gap: 16
      }}
    >
      <Button
        variant={'ghost'}
        color={'gray'}
        size={'2'}
        onClick={() => setIsCodeActionDialog(false)}
      >
        <Text weight={'bold'}>
          キャンセル
        </Text>
      </Button>
      <Button color='indigo'
        variant="soft"
        size={'3'}
      >
        <Text weight={'bold'}>
          反映
        </Text>
      </Button>
    </Flex></>)
}

export default CodeFix;
