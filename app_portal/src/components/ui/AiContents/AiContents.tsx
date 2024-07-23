// src/components/ui/AiContents/AiContents.tsx

import { Box, Flex } from "@radix-ui/themes";
import { AiResponseEffect } from "../AiResponseEffect/AiResponseEffect";
import { AiMessage } from "../AiMessage/AiMessage";
import { sAiContents } from "./AiContents.css";
import { AiContentProps } from "~/types/aiContentTypes";

type AiContentsProps = AiContentProps & {
  isLoadingVisible: boolean;
  createKintoneApp: (text: string) => void;
  actionType: string;
};

export const AiContents: React.FC<AiContentsProps> = ({ isLoadingVisible, createKintoneApp, aiMessage, chatHistoryItem, actionType }) => {
  return (
    <Box className={sAiContents}>
      <Flex
        direction={'row'}
      >
        <AiResponseEffect />
        <AiMessage
          isLoadingVisible={isLoadingVisible}
          createKintoneApp={createKintoneApp}
          aiMessage={aiMessage}
          chatHistoryItem={chatHistoryItem}
          actionType={actionType}
        />
      </Flex>
    </Box>
  );
};
