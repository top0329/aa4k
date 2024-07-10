// src/components/ui/AiResponseEffect/AiResponseEffect.tsx

import { Box } from "@radix-ui/themes";
import { sAiResponseEffect, sBlueCircle } from "./AiResponseEffect.css";

type AiResponseEffectProps = {
  top?: number;
  left?: number;
  zIndex?: number;
}

export const AiResponseEffect: React.FC<AiResponseEffectProps> = ({
  top = 25,
  left = 4,
  zIndex,
}) => {
  return (
    <Box className={sAiResponseEffect}>
      {/* TODO: 青丸エフェクト */}
      <Box
        className={sBlueCircle}
        style={{
          top: top,
          left: left,
          zIndex: zIndex,
        }}
      >
      </Box>
    </Box>
  );
};
