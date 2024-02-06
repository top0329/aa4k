// src/hooks/useCopyToClipboard.ts
import { useState } from "react";

export const useCopyToClipboard = () => {
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return { copyToClipboard, copySuccess };
};
