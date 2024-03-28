// src/components/feature/CodeActionDialog/CodeFix.tsx
import { Button, Flex, Text } from "@radix-ui/themes";

type CodeFixProps = {
  setIsCodeActionDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleReflectClick: () => Promise<void>;
}

const CodeFix: React.FC<CodeFixProps> = ({
  setIsCodeActionDialog,
  handleReflectClick
}) => {

  return (<>
    <Flex
      align={'center'}
      justify={'center'}
    >
      <Text size={'3'} weight={'bold'} color='gray'>
        編集したコードを反映しますか？
      </Text>
    </Flex>
    <Flex
      direction={'column'}
      py={'4'}
      gap={'1'}
    >
      <Text size={'1'} color='gray'>
        反映ボタンを押すと、運用環境に適用してアプリを更新します
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
        style={{
          cursor: 'pointer',
        }}
      >
        <Text weight={'bold'}>
          キャンセル
        </Text>
      </Button>
      <Button color='iris'
        variant="soft"
        size={'3'}
        onClick={handleReflectClick}
        style={{
          cursor: 'pointer',
        }}
      >
        <Text weight={'bold'}>
          反映
        </Text>
      </Button>
    </Flex></>)
}

export default CodeFix;
