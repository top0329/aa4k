import { useState, useEffect, useRef } from 'react';

/**
 * タイプライター効果でテキストを表示するカスタムフック
 * 
 * @param text - 表示するテキスト
 * @param isActive - タイプライター効果を有効にするかどうかを示すフラグ
 * @param delay - 各文字を表示する間隔（ミリ秒単位）。デフォルトは60ミリ秒
 * 
 * @returns (string) - タイプライター効果で表示されるテキスト
 */
const useTypewriter = (text: string, isActive: boolean, delay: number = 60) => {
  // タイプライター効果で表示されるテキストを保持するための状態
  const [displayedText, setDisplayedText] = useState('');
  // 現在表示している文字のインデックスを保持するための参照
  const indexRef = useRef(0);

  // タイプライターを開始するタイミングで初期化する
  useEffect(() => {
    if (isActive) {
      indexRef.current = 0;
      setDisplayedText('');
    }
  }, [isActive]);

  // タイプライターのメイン処理
  useEffect(() => {
    if (isActive && indexRef.current < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[indexRef.current]);
        indexRef.current++;
      }, delay);
      // setTimeoutのリセット処理（1文字単位で実行）
      return () => clearTimeout(timeout);
    }
  }, [isActive, displayedText, text, delay]);

  return displayedText;
};

export default useTypewriter;
