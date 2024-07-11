/**
 * 操作環境のサブドメインを取得
 * @returns サブドメイン
 */
export const getSubDomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts.slice(0, -2).join('.');
  }
  return '';
}
