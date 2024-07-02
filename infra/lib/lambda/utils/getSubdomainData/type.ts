// 型定義
// サブドメイン情報のKey
export type SubdomainResultKey = "subdomain" | "company_id" | "schema_name" | "trial_start_date" | "trial_end_date" | "contract_start_date" | "contract_end_date";
// サブドメイン情報取得クエリ結果行
export type SubdomainResultRow = Record<SubdomainResultKey, string>;
