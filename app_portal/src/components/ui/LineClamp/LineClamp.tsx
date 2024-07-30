// src\components\ui\LineClamp\LineClamp.tsx

import { Box, Flex, Text } from '@radix-ui/themes';
import { TextProps } from 'node_modules/@radix-ui/themes/dist/esm/components/text';
import { useEffect, useRef, useState } from 'react';
import { Field } from '~/types';
import FieldIcon from '../FieldIcon/FieldIcon';

type LineClampProps = {
  text: Field;
  lines: number;
  isOpen?: boolean;
} & TextProps;

const LineClamp = ({ text, lines, isOpen, ...props }: LineClampProps) => {
  const [clampedLabelText, setLineClampLabel] = useState(text.label);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    // 1行あたりの最大文字数を設定
    const maxCharCount = 13;
    // フィールド名のテキストが最大文字数を超える場合、クランプを実行
    if (text.label.length > maxCharCount) {
      if (!isOpen) {
        const clamped = text.label.slice(0, maxCharCount) + "..."; // 末尾の"..."を考慮して3文字分減らす
        setLineClampLabel(clamped);
      } else {
        const clamped = text.label.slice(0, maxCharCount);
        setLineClampLabel(clamped);
      }
    } else {
      setLineClampLabel(text.label); // クランプ不要の場合は元のテキストをそのまま使用
    }
  }, [text, lines, isOpen, containerRef]);

  return (
    <Box ref={containerRef}>
      <Flex direction={'column'} >
        <Flex align={'center'}>
          <FieldIcon displayType={text.displayType} />
          <Text {...props} style={{ color: '#5459FF', fontWeight: 700, fontSize: '12px' }} >
            {text.displayType}
          </Text>
        </Flex>
        <Text {...props} style={{ fontWeight: 400, fontSize: '14px' }}>
          {clampedLabelText}
        </Text>
      </Flex>
    </Box>
  );
};

export default LineClamp;
