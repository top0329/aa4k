// src/components/ui/AiContents/AiContents.tsx

import { Box, Flex } from "@radix-ui/themes";
import { AiResponseEffect } from "../AiResponseEffect/AiResponseEffect";
import { AiMessage } from "../AiMessage/AiMessage";
import { sAiContents } from "./AiContents.css";
import { AiContentProps } from "~/types/aiContentTypes";

type AiContentsProps = AiContentProps & {
  isLoadingVisible: boolean;
  toggleAiLoadVisibility: (text: string) => void;
};

export const AiContents: React.FC<AiContentsProps> = ({isLoadingVisible, toggleAiLoadVisibility})=> {
  return (
    <Box className={sAiContents}>
      <Flex
        direction={'row'}
      >
        <AiResponseEffect />
        {/* TODO: アクションタイプ(create,edit...)の渡し方 */}
        <AiMessage actionType="create" isLoadingVisible={isLoadingVisible} toggleAiLoadVisibility={toggleAiLoadVisibility} />
      </Flex>
    </Box>
  );
};
