// src\components\ui\AiLoad\AiLoad.tsx

import { Text, Box, Flex } from "@radix-ui/themes";
import { sAiLoad, sDot, sProcessingStateText, sProcessingStateTextEllipses } from "./AiLoad.css";

type AiLoadProps = {
  processingStateWhileLoadScreen: string,
};

export const AiLoad: React.FC<AiLoadProps> = ({ processingStateWhileLoadScreen }) => {
  // 三点リーダーを含め、処理状況の文字列を区切り文字にする
  const parts = processingStateWhileLoadScreen.split(/(…)/);

  return (
    <Flex className={sAiLoad} justify="center" align="center" direction={'column'} gap={'5'}>
      <Box style={{ marginTop: `5.5%` }}>
        {sDot.map((dotStyle, index) => (
          <Flex key={index} className={dotStyle}></Flex>
        ))}
      </Box>
      {/* app生成の処理状況を表示する */}
      <Box className={sProcessingStateText}>
        {parts.map((part, index) => (
          part === '…'
            ? <Text key={index} className={sProcessingStateTextEllipses}>{part}</Text>
            : <Text key={index}>{part}</Text>
        ))}
      </Box>
    </Flex>
  );
};
