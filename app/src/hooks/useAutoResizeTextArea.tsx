// src/components/TextArea.tsxで使用するカスタムフック
import { useEffect, useRef } from 'react';

// テキストエリアの高さを自動調整するカスタムフック
export const useAutoResizeTextArea = (value: string, maxRows: number = 10, lineHeight: number = 24) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textArea = textAreaRef.current;
    if (!textArea) return;

    // テキストエリアの高さを一旦リセット
    textArea.style.height = 'auto';
    // スクロール高さに基づいてテキストエリアの高さを設定
    const desiredHeight = textArea.scrollHeight;
    // 最大高さを計算（行の高さ x 最大行数）
    const maxHeight = lineHeight * maxRows;
    // 実際の高さが最大の高さを超えている場合は、最大高に制限する
    textArea.style.height = `${Math.min(desiredHeight, maxHeight)}px`;
  }, [value, maxRows]); // valueが変更されたときに高さを再計算

  return textAreaRef;
};
