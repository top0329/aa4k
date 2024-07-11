// src\components\ui\AiLoad\AiLoad.tsx

import { Flex } from "@radix-ui/themes";
import { sAiLoad, sDot } from "./AiLoad.css";

type AiLoadProps = {};

export const AiLoad: React.FC<AiLoadProps> = () => {
  return (
    <Flex className={sAiLoad} justify="center" align="center">
      {sDot.map((dotStyle, index) => (
        <Flex key={index} className={dotStyle}></Flex>
      ))}
    </Flex>
  );
};
