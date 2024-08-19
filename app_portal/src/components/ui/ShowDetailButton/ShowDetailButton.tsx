// src\components\ui\ShowDetailButton\ShowDetailButton.tsx

import React from "react";
import { sShowDetailButton, sText } from "./ShowDetailButton.css";
import { Box, Text } from "@radix-ui/themes";

type ShowDetailButtonProps = {
  onClick: () => void;
};

export const ShowDetailButton: React.FC<ShowDetailButtonProps> = ({ onClick }) => {

  const buttonText = "> 詳細を見る";

  return (
    <Box className={sShowDetailButton}>
      <Text
        className={sText}
        onClick={() => onClick()}
      >
        {buttonText}
      </Text>
    </Box>
  );
};
