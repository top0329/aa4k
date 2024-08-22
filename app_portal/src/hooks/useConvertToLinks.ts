// src/hooks/useConvertToLinks.ts

/**
 * テキスト内のURLを検出し、リンクに変換するカスタムフック
 * 
 * @param text - URLを含むテキスト
 * 
 * @returns
 *   リンクに変換したURLを含むテキスト
 */
export const useConvertToLinks = (
  text: string
) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url: string) => `<a href="${url}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">${url}</a>`);
};
