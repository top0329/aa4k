-- サブスクリプションテーブル
CREATE TABLE IF NOT EXISTS m_subscription( 
    subscription_id character varying (36) not null
    , company_id character varying (36) not null
    , schema_name character varying (60) not null
    , trial_start_date date
    , trial_end_date date
    , contract_start_date date
    , contract_end_date date
    , create_at timestamp (6) without time zone not null
    , update_at timestamp (6) without time zone
    , primary key (subscription_id)
);

-- 論理名／コメントの設定
comment on table m_subscription is 'サブスクリプションテーブル';
comment on column m_subscription.subscription_id is 'サブスクリプションID:契約ごとのID（UUID）';
comment on column m_subscription.company_id is '会社ID:契約した会社ID（UUID）';
comment on column m_subscription.schema_name is 'スキーマ名';
comment on column m_subscription.trial_start_date is 'トライアル開始予定日:トライアルを開始する予定日付（YYYY/MM/DD）';
comment on column m_subscription.trial_end_date is 'トライアル終了予定日:トライアルを終了する予定日付（YYYY/MM/DD）';
comment on column m_subscription.contract_start_date is '本契約開始日予定日:本契約を開始する予定日付（YYYY/MM/DD）';
comment on column m_subscription.contract_end_date is '本契約終了日予定日:本契約を終了する予定日付（YYYY/MM/DD）';
comment on column m_subscription.create_at is '登録日時';
comment on column m_subscription.update_at is '更新日時';
