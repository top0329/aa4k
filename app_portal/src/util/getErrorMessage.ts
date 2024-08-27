import { ErrorCode, ErrorMessage } from '~/constants';

/**
 * APIエラー時のエラーメッセージを取得
 * @returns エラーメッセージ
 */
export const getApiErrorMessage = (resStatus: number, errorCode?: ErrorCode) => {
  let errorMessage = '';
  if (!errorCode) {
    // API通信エラーの場合
    errorMessage = `${ErrorMessage.E_MSG011}（${resStatus}）`;
  } else if (errorCode === ErrorCode.A102002) {
    // バージョン不正の場合
    errorMessage = `${ErrorMessage.E_MSG014}（${errorCode}）`;
  } else if (errorCode === ErrorCode.A101003 || errorCode === ErrorCode.A101004) {
    // 未契約、契約外の場合
    errorMessage = `${ErrorMessage.E_MSG010}（${errorCode}）`;
  } else {
    // 上記以外のAPIエラーの場合
    errorMessage = `${ErrorMessage.E_MSG011}（${errorCode}）`;
  }

  return errorMessage;
}

/**
 * APIエラー時のエラーメッセージを取得（AI機能用）
 * @returns エラーメッセージ
 */
export const getApiErrorMessageForAI = (resStatus: number, errorCode?: ErrorCode) => {
  let errorMessage = '';
  if (!errorCode) {
    // API通信エラーの場合
    errorMessage = `${ErrorMessage.E_MSG011}（${resStatus}）`;
  } else if (errorCode === ErrorCode.A102002) {
    // バージョン不正の場合
    errorMessage = `${ErrorMessage.E_MSG014}（${errorCode}）`;
  } else if (errorCode === ErrorCode.A101003 || errorCode === ErrorCode.A101004) {
    // 未契約、契約外の場合
    errorMessage = `${ErrorMessage.E_MSG010}（${errorCode}）`;
  } else {
    // 上記以外のAPIエラーの場合
    errorMessage = `${ErrorMessage.E_MSG011}（${errorCode}）`;
  }

  return errorMessage;
}