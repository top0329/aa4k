// src/components/ui/AiMessage/AiMessage.tsx

import React from "react";
import { Box } from "@radix-ui/themes";
import { sAiMessage } from "./AiMessage.css";

type AiMessageProps = {
  actionType: string;
}

export const AiMessage: React.FC<AiMessageProps> = ({ actionType }) => {
  // TODO: typeによって表示コンポーネントの切り替え制御
  if (actionType === "create") {
    return (
      <Box className={sAiMessage}>
        かしこまりました。<br />
        議事録アプリを作成します。<br />
        以下の内容でよろしければ「アプリを作成する」をクリックしてください。<br />
        また、アプリ名やフィールドを変更したい場合は、わかりやすく指示してください。<br />
        ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー<br />
        アプリ名：<br />
        議事録<br />
        <br />
        代表的なフィールド（10項目）：<br />
        申請者名,申請日,目的地,出発日,帰着日,交通手段,交通費,宿泊費,食事代,その他の費用<br />
        {/* <AiConfirmation /> */}
      </Box>
    );
  }
};
