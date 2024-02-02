-- サブスクリプションテーブル
CREATE TABLE IF NOT EXISTS subscription (
  subscription_id character varying(36) not null
  , company_id character varying(36) not null
  , schema_name character varying(60) not null
  , trial_start_date date
  , trial_end_date date
  , contract_start_date date
  , contract_end_date date
  , create_at timestamp(6) without time zone not null
  , update_at timestamp(6) without time zone
  , primary key (subscription_id)
);