// src\components\ui\DefaultField\DefaultField.tsx

import { Flex, Text } from "@radix-ui/themes";
import { sDefaultField, sDefaultFieldIcon } from "./DefaultField.css";

type DefaultFieldProps = {
  icon: string;
  text: string;
};

export const DefaultField: React.FC<DefaultFieldProps> = ({ icon, text }) => (
  <Flex className={sDefaultField} >
    <img src={icon} alt="icon" className={sDefaultFieldIcon} />
    <Text
      style={{
        fontSize: '12px',
        fontStyle: 'normal',
        fontWeight: 700,
      }}
    >
      {text}
    </Text>
  </Flex>
);
