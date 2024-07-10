// src/components/ui/UserContent/UserContent.tsx

import { Box } from "@radix-ui/themes";
import { sUserContent } from "./UserContent.css";

type UserContentProps = {
  humanMessage: string;
}

export const UserContent: React.FC<UserContentProps> = ({ humanMessage }) => {
  return (
    <Box className={sUserContent}>
      {humanMessage}
    </Box>
  );
};
