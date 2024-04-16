// src/hooks/useCopyToClipboard.ts
import { useState } from "react";

type CopySuccessState = {
  [key: string]: boolean;
};

export const useCopyToClipboard = () => {
  const [copySuccess, setCopySuccess] = useState<CopySuccessState>({});

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess({ ...copySuccess, [key]: true });
      setTimeout(() => setCopySuccess({ ...copySuccess, [key]: false }), 2000);
    });
  };

  return { copyToClipboard, copySuccess };
};
