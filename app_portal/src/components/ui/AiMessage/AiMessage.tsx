// src/components/ui/AiMessage/AiMessage.tsx

import React from "react";
import { Box, Flex } from "@radix-ui/themes";
import { CreateAppButton } from "../CreateAppButton/CreateAppButton";
import { sAiMessage } from "./AiMessage.css";
import { vars } from "~/styles/theme.css";

type AiMessageProps = {
  actionType: string;
  isLoadingVisible: boolean;
  toggleAiLoadVisibility: (text: string) => void;
}

export const AiMessage: React.FC<AiMessageProps> = ({ actionType, isLoadingVisible, toggleAiLoadVisibility }) => {

  // デモ用のメッセージ
  const aiMessage = "議事録アプリを作成します。\n以下の内容でよろしければ「アプリを作成する」をクリックしてください。\nまた、アプリ名やフィールドを変更したい場合は、わかりやすく指示してください。";
  const appInfo = "アプリ名：\n議事録アプリ\n\n代表的なフィールド（10項目）：\n申請者名,申請日,目的地,出発日,帰着日,交通手段,交通費,宿泊費,食事代,その他の費用";
  // ロード画面用のメッセージ
  const loadingMessage = "かしこまりました。アプリを作成しますので少々お待ちください。\n作成が完了すると、アプリ画面に遷移します。";

  // TODO: typeによって表示コンポーネントの切り替え制御
  if (actionType === "create") {
    return (
      <Flex>
        <Box className={sAiMessage}>
          <Flex direction={'column'} gap={'4'}>
            <Box style={{ whiteSpace: "pre-wrap" }}>
              {/* TODO:AI応答内容の表示 */}
              {!isLoadingVisible ? aiMessage : loadingMessage}
            </Box>
            {!isLoadingVisible && (<CreateAppButton
              onClick={(text) => toggleAiLoadVisibility(text)}
            />)}
            {!isLoadingVisible && (<Box p={'1'} style={{ backgroundColor: vars.color.grayA.grayA1, borderRadius: 4, whiteSpace: "pre-wrap" }}>
              {/* TODO:フィールド情報の表示 */}
              {appInfo}
            </Box>)}
          </Flex>
        </Box>
      </Flex>
    );
  }
};
