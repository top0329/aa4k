// src/components/ui/AiResponseEffect/AiResponseEffect.tsx

import { Box } from "@radix-ui/themes";
import { sAiResponseEffect, sBlueCircle, sInnerCircleAnimated, sOuterCircleAnimated } from "./AiResponseEffect.css";

type AiResponseEffectProps = {}

export const AiResponseEffect: React.FC<AiResponseEffectProps> = ({}) => {

  return (
    <Box className={sAiResponseEffect}>
      <Box
        className={sBlueCircle}
        style={{
          marginTop: '50%',
          marginLeft: '20%',
        }}
      >
        <Box className={sInnerCircleAnimated}></Box>
        <Box className={sOuterCircleAnimated}></Box>
      </Box>
    </Box>
  );
};
