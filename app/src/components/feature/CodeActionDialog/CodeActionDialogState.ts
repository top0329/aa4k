// src/components/feature/CodeActionDialog/CodeActionDialogState.ts
import { atom } from "jotai";
import { CodeActionDialogType, CodeCheckStatus } from "~/types/codeActionTypes";

export const isCodeActionDialogState = atom(false);
export const codeActionDialogTypeState = atom<CodeActionDialogType>("codeCheck");
export const codeViolationsState = atom<string[]>([
  "短時間で大量のリクエスト送信を避ける: フィールド情報を500回取得している部分が該当します。",
  "エラーメッセージの表示: システムエラーが発生した場合のエラーメッセージがユーザーフレンドリーではありません。",
  `変数のスコープ: 'revision'変数がグローバルスコープで定義されています。`,
  "短時間で大量のリクエスト送信を避ける: フィールド情報を500回取得している部分が該当します。",
  "エラーメッセージの表示: システムエラーが発生した場合のエラーメッセージがユーザーフレンドリーではありません。",
  `変数のスコープ: 'revision'変数がグローバルスコープで定義されています。`,
  "短時間で大量のリクエスト送信を避ける: フィールド情報を500回取得している部分が該当します。",
  "エラーメッセージの表示: システムエラーが発生した場合のエラーメッセージがユーザーフレンドリーではありません。",
  `変数のスコープ: 'revision'変数がグローバルスコープで定義されています。`,
  "短時間で大量のリクエスト送信を避ける: フィールド情報を500回取得している部分が該当します。",
  "エラーメッセージの表示: システムエラーが発生した場合のエラーメッセージがユーザーフレンドリーではありません。",
  `変数のスコープ: 'revision'変数がグローバルスコープで定義されています。`,
  "短時間で大量のリクエスト送信を避ける: フィールド情報を500回取得している部分が該当します。",
  "エラーメッセージの表示: システムエラーが発生した場合のエラーメッセージがユーザーフレンドリーではありません。",
  `変数のスコープ: 'revision'変数がグローバルスコープで定義されています。`,
  "短時間で大量のリクエスト送信を避ける: フィールド情報を500回取得している部分が該当します。",
  "エラーメッセージの表示: システムエラーが発生した場合のエラーメッセージがユーザーフレンドリーではありません。",
  `変数のスコープ: 'revision'変数がグローバルスコープで定義されています。`,
]);
export const codeCheckStatusState = atom<CodeCheckStatus>("success");
