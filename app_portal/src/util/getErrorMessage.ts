import { ErrorCode, ErrorMessage } from '~/constants';

/**
 * APIエラー時のエラーメッセージを取得
 * @returns エラーメッセージ
 */
export const getApiErrorMessage = (resStatus: number, errorCode?: ErrorCode) => {
  let errorMessage = '';
  if (!errorCode) {
    // API通信エラーの場合
    errorMessage = `${ErrorMessage.E_MSG001}（${resStatus}）`;
  } else if (errorCode === ErrorCode.A02002) {
    // バージョン不正の場合
    errorMessage = `${ErrorMessage.E_MSG002}（${errorCode}）`;
  } else if (errorCode === ErrorCode.A01003 || errorCode === ErrorCode.A01004) {
    // 未契約、契約外の場合
    errorMessage = `${ErrorMessage.E_MSG003}（${errorCode}）`;
  } else {
    // 上記以外のAPIエラーの場合
    errorMessage = `${ErrorMessage.E_MSG001}（${errorCode}）`;
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
    errorMessage = `${ErrorMessage.E_MSG008}（${resStatus}）`;
  } else if (errorCode === ErrorCode.A02002) {
    // バージョン不正の場合
    errorMessage = `${ErrorMessage.E_MSG002}（${errorCode}）`;
  } else if (errorCode === ErrorCode.A01003 || errorCode === ErrorCode.A01004) {
    // 未契約、契約外の場合
    errorMessage = `${ErrorMessage.E_MSG003}（${errorCode}）`;
  } else {
    // 上記以外のAPIエラーの場合
    errorMessage = `${ErrorMessage.E_MSG008}（${errorCode}）`;
  }

  return errorMessage;
}