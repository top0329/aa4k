// src\components\ui\ShowDetailButton\ShowDetailButton.tsx

import React from "react";
import {sShowDetailButton, sText} from "./ShowDetailButton.css";
import { Box, Text } from "@radix-ui/themes";

type ShowDetailButtonProps = {
  onClick: () => void;
  top?: number;
  right?: number;
  zIndex?: number;
};

export const ShowDetailButton: React.FC<ShowDetailButtonProps> = ({ onClick,
  top = 0,
  right = 0,
  zIndex = 2000
}) => {
  const buttonText = "> 詳細を見る";
  return (
    <Box
      className={sShowDetailButton}
      style={{
        top: `${top}px`,
        right: `${right}px`,
        zIndex: zIndex,
      }}
      onClick={() => onClick()}
    >
      <Text className={sText}>{buttonText}</Text>
    </Box>
  );
};
