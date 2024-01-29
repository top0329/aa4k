/**
 * プログラムコードへ行数を設定
 * @param code 
 * @returns 行数付きcodeテキスト
 */
export function addLineNumbersToText(code: string) {
  if(!code) return "";
  // 各行を改行で分割
  const lines = code.split('\n');

  // 各行に行番号を付ける
  const numberedLines = lines.map((line, index) => {
    const lineNumber = index + 1;
    return `${lineNumber} | ${line}`;
  });

  // 改行で結合して結果のテキストを生成
  return numberedLines.join('\n');
}

/**
 * 指定の行へのコード挿入・削除・更新
 * @param originalCode 
 * @param startLine 
 * @param endLine 
 * @param delCount 
 * @param newCode 
 * @returns 編集後のコード
 */
export function modifyCode(originalCode: string, startLine: number, endLine: number, delCount: number, newCode: string) {
  // コードを行ごとに分割
  const lines = originalCode.split('\n');
  // 指定された範囲の行を削除し、新しいコードを挿入する
  // spliceの第二引数には削除する要素の数を指定する
  // newCodeが空文字列の場合は、単に範囲を削除する
  if (delCount) {
    lines.splice(startLine - 1, delCount)
  } else {
    lines.splice(startLine - 1, endLine - startLine + 1, newCode);
  }
  // 行を再結合して返す
  return lines.join('\n');
}
