import { Client, QueryResult } from "pg";
import { PromptInfo } from "./type"

/**
 * プロンプトTBLの検索
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const selectPromptInfo = async (dbClient: Client, serviceDivList: string[], pluginVersion: string): Promise<QueryResult<PromptInfo>> => {
  const versionArray = pluginVersion.split('.').map(Number);
  const pram = [
    serviceDivList,
    versionArray[0],
    versionArray[1],
    versionArray[2],
  ];
  let sql = "";
  sql += `select`;
  sql += ` a.service_div as service_div`;
  sql += ` ,a.prompt as prompt`;
  sql += ` ,json_agg(`;
  sql += ` json_build_object(`;
  sql += ` 'item_id', b.item_id,`;
  sql += ` 'parent_item_id', parent_item_id,`;
  sql += ` 'item_name', item_name,`;
  sql += ` 'item_type', item_type,`;
  sql += ` 'item_describe', item_describe,`;
  sql += ` 'constants', constants`;
  sql += ` )`;
  sql += ` order by b.item_id, b.parent_item_id`;
  sql += ` ) as prompt_function_parameter`;
  sql += ` from`;
  sql += ` m_prompt a`;
  sql += ` left join  m_prompt_fc b`;
  sql += ` on a.service_div = b.service_div`;
  sql += ` and a.plugin_major_version = b.plugin_major_version`;
  sql += ` and a.plugin_minor_version = b.plugin_minor_version`;
  sql += ` and a.plugin_patch_version = b.plugin_patch_version`;
  sql += ` where`;
  sql += ` (a.service_div, a.plugin_major_version, a.plugin_minor_version, a.plugin_patch_version) in (`;
  sql += ` select`;
  sql += ` a.service_div,`;
  sql += ` max(a.plugin_major_version) as plugin_major_version,`;
  sql += ` max(a.plugin_minor_version) as plugin_minor_version,`;
  sql += ` max(a.plugin_patch_version) as plugin_patch_version`;
  sql += ` from`;
  sql += ` m_prompt a`;
  sql += ` where`;
  sql += ` a.service_div = any($1::varchar[])`;
  sql += ` and (a.plugin_major_version, a.plugin_minor_version, a.plugin_patch_version) <= ($2,$3,$4)`;
  sql += ` group by`;
  sql += ` a.service_div`;
  sql += ` )`;
  sql += ` group by`;
  sql += ` a.service_div,`;
  sql += ` a.prompt`;
  sql += ` order by`;
  sql += ` a.service_div;`;

  return await dbClient.query(sql, pram);
};
