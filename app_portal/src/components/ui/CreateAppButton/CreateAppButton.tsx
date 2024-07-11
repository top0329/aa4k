// src\components\ui\CreateAppButton\CreateAppButton.tsx

import React from "react";
import { sTriangleIcon, sTriangleIconHover, sCreateAppButton, sText, sTextHover } from "./CreateAppButton.css";
import { Box, Text } from "@radix-ui/themes";

type CreateAppButtonProps = {
  onClick: (text: string) => void;
  top?: number;
  right?: number;
  zIndex?: number;
};

export const CreateAppButton: React.FC<CreateAppButtonProps> = ({ onClick,
  top = 0,
  right = 0,
  zIndex = 2000
}) => {
  const buttonText = "アプリを作成する";
  return (
    <Box
      className={sCreateAppButton}
      style={{
        top: `${top}px`,
        right: `${right}px`,
        zIndex: zIndex,
      }}
      onClick={() => onClick(buttonText)}
    >
      <Text className={`${sTriangleIcon} ${sTriangleIconHover}`}></Text>
      <Text className={`${sText} ${sTextHover}`}>{buttonText}</Text>
    </Box>
  );
};
