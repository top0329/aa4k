import { Client } from "pg";

/**
 * ポータルJSバージョン管理TBL検索
 * @param dbClient 
 */
export const selectPortalJsVersion = async (dbClient: Client) => {
  const pram = [
    false,
  ];

  let sql = "";
  sql += `select`;
  sql += ` major_version`;
  sql += ` , minor_version`;
  sql += ` , patch_version`;
  sql += ` , concat_ws('.', major_version, minor_version, patch_version) as version`;
  sql += ` from`;
  sql += ` m_portal_js_version`;
  sql += ` where`;
  sql += ` is_disabled = $1`;

  return await dbClient.query(sql, pram);
}