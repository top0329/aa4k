// src/components/ui/AiResponseEffect/AiResponseEffect.tsx

import { Box } from "@radix-ui/themes";
import { sAiResponseEffect, sBlueCircle, sInnerCircleAnimated, sOuterCircleAnimated } from "./AiResponseEffect.css";
import { AiMessage, ErrorMessage } from "~/types";

type AiResponseEffectProps = {
  aiMessage: AiMessage | ErrorMessage;
  isLoadingVisible: boolean;
}

export const AiResponseEffect: React.FC<AiResponseEffectProps> = ({ aiMessage, isLoadingVisible }) => {

  // アニメーションの活性/非活性
  const isCircleEffectActive = !aiMessage.content || isLoadingVisible;

  return (
    <Box className={sAiResponseEffect}>
      <Box
        className={sBlueCircle}
        style={{
          marginTop: '50%',
          marginLeft: '20%',
        }}
      >
        {isCircleEffectActive && (
          <>
            <Box className={sInnerCircleAnimated} />
            <Box className={sOuterCircleAnimated} />
          </>
        )}
      </Box>
    </Box>
  );
};
