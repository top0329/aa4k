import { Client, QueryResult } from "pg";
import { PromptInfo } from "./type"

/**
 * プロンプトTBLの検索
 * @param dbClient 
 * @param reqBody
 * @returns クエリ実行結果
 */
export const selectPromptInfo = async (dbClient: Client, serviceDivList: string[], version: string): Promise<QueryResult<PromptInfo>> => {
  const versionArray = version.split('.').map(Number);
  const pram = [
    serviceDivList,
    versionArray[0],
    versionArray[1],
    versionArray[2],
  ];
  let sql = "";
  sql += ` select `;
  sql += ` p.service_div as service_div`;
  sql += ` , p.prompt as prompt`;
  sql += ` , json_agg(`;
  sql += ` json_build_object(`;
  sql += ` 'item_id', fc.item_id,`;
  sql += ` 'parent_item_id', fc.parent_item_id,`;
  sql += ` 'item_name', fc.item_name,`;
  sql += ` 'item_type', fc.item_type,`;
  sql += ` 'item_describe', fc.item_describe,`;
  sql += ` 'constants', fc.constants`;
  sql += ` )`;
  sql += ` order by fc.item_id, fc.parent_item_id`;
  sql += ` ) as prompt_function_parameter`;
  sql += ` from (`;
  sql += ` select service_div, plugin_major_version, plugin_minor_version, plugin_patch_version, prompt`;
  sql += ` from (`;
  sql += ` select service_div,`;
  sql += ` plugin_major_version,`;
  sql += ` plugin_minor_version,`;
  sql += ` plugin_patch_version,`;
  sql += ` prompt,`;
  sql += ` ROW_NUMBER() OVER (PARTITION BY service_div order by plugin_major_version DESC, plugin_minor_version DESC, plugin_patch_version DESC) as rn`;
  sql += ` from m_prompt`;
  sql += ` where`;
  sql += ` service_div = any($1::varchar[])`;
  sql += ` and (plugin_major_version, plugin_minor_version, plugin_patch_version) <= ($2,$3,$4)`;
  sql += ` ) sub`;
  sql += ` where rn = 1`;
  sql += ` ) p`;
  sql += ` left join m_prompt_fc fc`;
  sql += ` ON p.service_div = fc.service_div`;
  sql += ` and p.plugin_major_version = fc.plugin_major_version`;
  sql += ` and p.plugin_minor_version = fc.plugin_minor_version`;
  sql += ` and p.plugin_patch_version = fc.plugin_patch_version`;
  sql += ` group by`;
  sql += ` p.service_div, p.prompt`;

  return await dbClient.query(sql, pram);
};
