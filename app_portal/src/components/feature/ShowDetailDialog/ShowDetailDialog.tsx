// src\components\feature\ShowDetailDialog\ShowDetailDialog.tsx

import React from "react";
import { Box, Flex, Separator, Text } from "@radix-ui/themes";
import { sShowDetailDialog } from "./ShowDetailDialog.css";
import CloseButton from "~/components/ui/CloseButton/CloseButton";
import { useShowDetailDialogLogic } from "./useShowDetailDialogLogic";
import AccordionShowDetail from "../AccordionShowDetail/AccordionShowDetail";

type ShowDetailDialogProps = {
  showDetailDialogScrollRef: React.MutableRefObject<HTMLDivElement | null>;
}

const ShowDetailDialog: React.FC<ShowDetailDialogProps> = ({ showDetailDialogScrollRef }) => {

  // ShowDetailDialogコンポーネントのロジックを管理するカスタムフック
  const {
    toggleShowDetailDialogVisibility,
  } = useShowDetailDialogLogic({});

  return (
    <Box className={sShowDetailDialog}>
      <CloseButton
        onClick={() => toggleShowDetailDialogVisibility()}
        className="small"
      />
      <Flex
        justify={'start'}
        align={'start'}
        direction={'column'}
        p={'0'}
        gap={'3'}
        style={{
          paddingLeft: '16px',
          paddingTop: '14px',
          paddingRight: '16px',
          paddingBottom: '13px',
        }}
      >
        <Text
          style={{
            fontSize: '14px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: '30px',
            letterSpacing: '0.28px',
          }}
        >
          フィールド一覧
        </Text>
        <Separator size={'4'} style={{ backgroundColor: "#F9F9F9" }} />
      </Flex>
      <AccordionShowDetail showDetailDialogScrollRef={showDetailDialogScrollRef} />
    </Box>
  );
};

export default ShowDetailDialog;
