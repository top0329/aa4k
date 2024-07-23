// src/components/ui/AiResponseEffect/AiResponseEffect.tsx

import { Box } from "@radix-ui/themes";
import { sAiResponseEffect, sBlueCircle, sInnerCircleAnimated, sOuterCircleAnimated } from "./AiResponseEffect.css";

type AiResponseEffectProps = {
  top?: number;
  left?: number;
  zIndex?: number;
}

export const AiResponseEffect: React.FC<AiResponseEffectProps> = ({
  top = 25,
  left = 8,
  zIndex,
}) => {
  return (
    <Box className={sAiResponseEffect}>
      <Box
        className={`${sBlueCircle} `}
        style={{
          top: top,
          left: left,
          zIndex: zIndex,
        }}
      >
        <Box className={sInnerCircleAnimated}></Box>
        <Box className={sOuterCircleAnimated}></Box>
      </Box>
    </Box>
  );
};
