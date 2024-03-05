-- 会社テーブル
CREATE TABLE IF NOT EXISTS m_company( 
    company_id character varying (36) not null
    , company_name character varying (60) not null
    , company_name_kana character varying (60)
    , is_deleted boolean default false not null
    , created_at timestamp (6) without time zone not null
    , updated_at timestamp (6) without time zone
    , primary key (company_id)
);

-- 論理名／コメントの設定
comment on table m_company is '会社テーブル';
comment on column m_company.company_id is '会社ID:会社ごとのID（UUID）';
comment on column m_company.company_name is '会社名';
comment on column m_company.company_name_kana is '会社名カナ';
comment on column m_company.is_deleted is '削除状態:true：無効状態、false：有効状態';
comment on column m_company.created_at is '登録日時';
comment on column m_company.updated_at is '更新日時';