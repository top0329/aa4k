import { useState, useEffect, useRef } from 'react';

/**
 * タイプライター効果でテキストを表示するカスタムフック
 * 
 * @param text - 表示するテキスト
 * @param isActive - タイプライター効果を有効にするかどうかを示すフラグ
 * @param delay - 各文字を表示する間隔（ミリ秒単位）。デフォルトは10ミリ秒
 * 
 * @returns (string) - タイプライター効果で表示されるテキスト
 */
const useTypewriter = (text: string, isActive: boolean, delay: number = 10) => {
  // タイプライター効果で表示されるテキストを保持するための状態
  const [displayedText, setDisplayedText] = useState('');
  // タイプライターの出力が完了したかどうかを示す状態
  const [isComplete, setIsComplete] = useState(false);
  // 現在表示している文字のインデックスを保持するための参照
  const indexRef = useRef(0);

  // タイプライターを開始するタイミングで初期化する
  useEffect(() => {
    if (isActive) {
      indexRef.current = 0;
      setDisplayedText('');
      setIsComplete(false);
    }
  }, [isActive]);

  // タイプライターのメイン処理
  useEffect(() => {
    if (isActive && indexRef.current < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[indexRef.current]);
        indexRef.current++;
        if (indexRef.current === text.length) {
          setIsComplete(true); // 全ての文字が表示されたら完了フラグをtrueにする
        }
      }, delay);
      // setTimeoutのリセット処理（1文字単位で実行）
      return () => clearTimeout(timeout);
    }
  }, [isActive, displayedText, text, delay]);

  return [displayedText, isComplete] as const;
};

export default useTypewriter;
