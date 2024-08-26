// src/components/ui/AiContents/AiContents.tsx

import { Box, Flex } from "@radix-ui/themes";
import { AiResponseEffect } from "../AiResponseEffect/AiResponseEffect";
import { AiMessage } from "../AiMessage/AiMessage";
import { sAiContents, sStandbyMessage } from "./AiContents.css";
import { AiContentProps } from "~/types/aiContentTypes";

type AiContentsProps = AiContentProps & {
  isLoadingVisible: boolean;
  createKintoneApp: (text: string) => void;
  actionType: string;
  setIsShowDetailDialogVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export const AiContents: React.FC<AiContentsProps> = ({ isLoadingVisible, createKintoneApp, aiMessage, chatHistoryItem, actionType, setIsShowDetailDialogVisible }) => {
  return (
    <Box className={sAiContents}>
      <Flex
        direction={'row'}
      >
        <AiResponseEffect aiMessage={aiMessage} isLoadingVisible={isLoadingVisible} />
        {!aiMessage.content && <Box className={sStandbyMessage}>AIに問い合わせ中です、少々お待ちください</Box>}
        {aiMessage.content &&
          <AiMessage
            isLoadingVisible={isLoadingVisible}
            createKintoneApp={createKintoneApp}
            aiMessage={aiMessage}
            chatHistoryItem={chatHistoryItem}
            actionType={actionType}
            setIsShowDetailDialogVisible={setIsShowDetailDialogVisible}
          />
        }
      </Flex>
    </Box>
  );
};
