// 型定義
// サブスクリプション情報のKey
export type SubscriptionResultKey = "subscription_id" | "company_id" | "schema_name" | "trial_start_date" | "trial_end_date" | "contract_start_date" | "contract_end_date";
// サブスクリプション情報取得クエリ結果行
export type SubscriptionResultRow = Record<SubscriptionResultKey, string>;
