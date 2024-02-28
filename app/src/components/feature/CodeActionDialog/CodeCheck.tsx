// src/components/feature/CodeActionDialog/CodeFix.tsx
import { faClose } from "@fortawesome/pro-duotone-svg-icons";
import { Box, Button, Flex, ScrollArea, Text } from "@radix-ui/themes";
import IconTooltipButton from "~/components/ui/IconTooltipButton/IconTooltipButton";
import DonutLoading from "~/components/ui/Loading/DonutLoading/DonutLoading";
import { CodeCheckStatus } from "~/constants";
import { vars } from "~/styles/theme.css";

type CodeCheckProps = {
  isLoading: boolean;
  codeCheckStatus: CodeCheckStatus;
  setIsCodeActionDialog: React.Dispatch<React.SetStateAction<boolean>>;
  codeViolations: string[];
}

const CodeCheck: React.FC<CodeCheckProps> = ({
  isLoading,
  codeCheckStatus,
  setIsCodeActionDialog,
  codeViolations,
}) => {

  const LoadingStatus = () => <>
    <Flex
      align={'center'}
      justify={'center'}
      direction={'column'}
    >

      <Box
        py={'4'}>
        <Text size={'3'} weight={'bold'} color='crimson'>
          コードチェック中
        </Text>
      </Box>
      <Box
        pt={'4'}>
        <DonutLoading
          isLoading={isLoading}
          borderColor={`${vars.color.crimson.crimson10} ${vars.color.crimson.crimson6} ${vars.color.crimson.crimson6}`}
        />
      </Box>
    </Flex>
    <Flex
      width={'100%'}
      pt={'5'}
      align={'center'}
      justify={'end'}
      style={{
        gap: 16
      }}
    >
      <Button
        variant={'soft'}
        color={'crimson'}
        size={'2'}
        onClick={() => setIsCodeActionDialog(false)}
      >
        <Text weight={'bold'}>
          キャンセル
        </Text>
      </Button>

    </Flex></>

  const SafeStatus = () => <>
    <Flex
      align={'center'}
      justify={'center'}
    >
      <Text size={'3'} weight={'bold'}>
        コードチェックが完了しました
      </Text>
    </Flex>
    <Flex
      direction={'column'}
      py={'4'}
    >
      <Text size={'1'} color='gray'>
        編集されたコード内にガイドラインに違反する箇所は見つかりませんでした
      </Text>
    </Flex>
    <Flex
      width={'100%'}
      pt={'5'}
      align={'center'}
      justify={'end'}
      style={{
        gap: 16
      }}
    >
      <IconTooltipButton
        icon={faClose}
        tooltip={"閉じる"}
        onClick={() => setIsCodeActionDialog(false)}
        pressedColor={vars.color.grayA.grayA12}
        defaultColor={vars.color.gray.gray10}
      />

    </Flex>
  </>

  const CautionStatus = () => <>
    <Flex
      py={'4'}
      align={'center'}
    >
      <Text size={'1'} color='tomato'>
        次のガイドライン違反の可能性がありますのでご注意ください。
      </Text>
    </Flex>
    <ScrollArea scrollbars="vertical" style={{ height: 380 }}>
      <Box
        py={'4'}
        style={{
          background: vars.color.slate.slate2,
        }}
      >
        <Flex
          px={'5'}
          direction={'column'}
          gap={'0'}
        >
          {codeViolations.map((violation, index) => (
            <Box key={index}>
              <Text size={'2'} color={'gray'}>
                {violation}
              </Text>
            </Box>
          ))}
        </Flex>
      </Box>
    </ScrollArea>
    <Flex
      width={'100%'}
      pt={'5'}
      align={'center'}
      justify={'end'}
      style={{
        gap: 16
      }}
    >
      <IconTooltipButton
        icon={faClose}
        tooltip={"閉じる"}
        onClick={() => setIsCodeActionDialog(false)}
        pressedColor={vars.color.grayA.grayA12}
        defaultColor={vars.color.gray.gray10}
      />

    </Flex>
  </>

  switch (codeCheckStatus) {
    case CodeCheckStatus.safe:
      return <SafeStatus />;
    case CodeCheckStatus.loading:
      return <LoadingStatus />;
    case CodeCheckStatus.caution:
      return <CautionStatus />;
    default:
      const unexpected: never = codeCheckStatus
      throw Error("想定されていないcodeCheckStatusです. codeCheckStatus=", unexpected)
  }
}

export default CodeCheck;
