// src\components\ui\DefaultFieldContent\DefaultFieldContent.tsx

import { Text, Flex, Separator, Box } from "@radix-ui/themes";
import React from "react";
import categoryIcon from "~/assets/fieldType/default/categoryIcon.svg";
import dateRefIcon from "~/assets/fieldType/default/dateRefIcon.svg";
import recordNumIcon from "~/assets/fieldType/default/recordNumIcon.svg";
import revisionIcon from "~/assets/fieldType/default/revisionIcon.svg";
import statusIcon from "~/assets/fieldType/default/statusIcon.svg";
import userRefIcon from "~/assets/fieldType/default/userRefIcon.svg";
import { DefaultField } from "../DefaultField/DefaultField";
import { sDefaultFieldContent, sDefaultFieldList } from "./DefaultFieldContent.css";

type DefaultFieldContentProps = {}

export const DefaultFieldContent: React.FC<DefaultFieldContentProps> = ({ }) => {
  // 各フィールドのアイコンとラベル名
  const fields = [
    { icon: recordNumIcon, text: 'レコード番号' },
    { icon: revisionIcon, text: 'リビジョン' },
    { icon: categoryIcon, text: 'カテゴリー' },
    { icon: userRefIcon, text: '作成者' },
    { icon: userRefIcon, text: '更新者' },
    { icon: recordNumIcon, text: 'レコードID' },
    { icon: statusIcon, text: 'ステータス' },
    { icon: userRefIcon, text: '作業者' },
    { icon: dateRefIcon, text: '作成日時' },
    { icon: dateRefIcon, text: '更新日時' },
  ];
  // 固定フィールドのリストを2列に分割
  const leftFields = fields.slice(0, Math.ceil(fields.length / 2)); // 前半半分
  const rightFields = fields.slice(Math.ceil(fields.length / 2)); // 後半半分

  return (
    <Flex
      justify={'center'}
      align={'center'}
      direction={'column'}
      p={'4'}
      gap={'1'}
      className={sDefaultFieldContent}>
      <Text
        style={{
          fontSize: '10px',
          fontStyle: 'normal',
          fontWeight: 700,
        }}
      >
        固定フィールド
      </Text>
      <Text
        style={{
          fontSize: '10px',
          fontStyle: 'normal',
          fontWeight: 400,
        }}
      >
        下記フィールドは指定できません</Text>
      <Separator size={'4'} style={{ backgroundColor: "#E8E8E8", marginBottom: "4px" }} />
      <Flex direction={'row'} className={sDefaultFieldList}>
        <Box>
          {leftFields.map((field, index) => (
            <DefaultField key={index} icon={field.icon} text={field.text} />
          ))}
        </Box>
        <Box>
          {rightFields.map((field, index) => (
            <DefaultField key={index} icon={field.icon} text={field.text} />
          ))}
        </Box>
      </Flex>
    </Flex >
  );
};