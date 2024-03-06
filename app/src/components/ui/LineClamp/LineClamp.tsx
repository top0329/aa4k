import { Text } from '@radix-ui/themes';
import { TextProps } from 'node_modules/@radix-ui/themes/dist/esm/components/text';
import { useEffect, useRef, useState } from 'react';

type LineClampProps = {
  text: string
  lines: number;
} & TextProps;

const LineClamp = ({ text, lines, ...props }: LineClampProps) => {
  const [clampedText, setLineClamp] = useState(text);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // コンテナの幅を取得
    const containerWidth = containerRef.current.clientWidth;
    // 1行あたりの推定文字数を計算
    const charPerLine = Math.floor(containerWidth / 8); // 1文字あたりの平均幅を12pxと仮定
    // 最大文字数を計算
    const maxCharCount = charPerLine * lines;

    // テキストが最大文字数を超える場合、クランプを実行
    if (text.length > maxCharCount) {
      const clamped = text.slice(0, maxCharCount) + "..."; // 末尾の"..."を考慮して3文字分減らす
      setLineClamp(clamped);
    } else {
      setLineClamp(text); // クランプ不要の場合は元のテキストをそのまま使用
    }
  }, [text, lines, containerRef]);

  return (
    <Text {...props} ref={containerRef}>
      {clampedText}
    </Text>
  );
};

export default LineClamp;
