// src/hooks/useCopyToClipboard.ts
import { useState } from "react";

type CopySuccessState = {
  [key: string]: boolean;
};

export const useCopyToClipboard = () => {
  const [copySuccess, setCopySuccess] = useState<CopySuccessState>({});

  // テキストをクリップボードにコピー
  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // コピー成功時、対応するキーの値をtrueに設定（ex: {humanMessage: true}）
      setCopySuccess(prevState => ({ ...prevState, [key]: true }));
      // 2秒後に対応するキーの値をfalseに戻す
      setTimeout(() => setCopySuccess(prevState => ({ ...prevState, [key]: false })), 2000);
    });
  };

  return { copyToClipboard, copySuccess };
};
