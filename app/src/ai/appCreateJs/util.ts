/**
 * プログラムコードへ行数を設定
 * @param code 
 * @returns 行数付きcodeテキスト
 */
export function addLineNumbersToCode(code: string) {
  if (!code) return "";
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
 * コード編集(追加・更新・削除)
 *     追加: originalCodeに対し、startLine~delCountのコードをnewCodeで置き換える
 *     更新: originalCodeに対し、startLineにnewCodeを追加
 *     削除: originalCodeに対し、startLine~delCountのコードを削除
 * @param originalCode
 * @param startLine
 * @param delCount
 * @param newCode
 * @returns 編集後のコード
 */
export function modifyCode(originalCode: string, startLine: number, delCount: number, newCode: string) {
  // コードを行ごとに分割
  const lines = originalCode.split('\n');

  // 更新: 指定された位置から、delCountの行数分を新しいコードで置き換える)
  // 追加: 指定された行の前に新しいコードを挿入
  // 削除: 指定された行から指定された数（delCount）の行を削除
  lines.splice(startLine - 1, delCount, newCode);

  // 行を再結合して返す
  return lines.join('\n');
}
