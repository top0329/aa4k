-- プロンプトテーブル
CREATE TABLE IF NOT EXISTS m_prompt( 
    service_div VARCHAR(20) NOT NULL
    , plugin_major_version INTEGER NOT NULL
    , plugin_minor_version INTEGER NOT NULL
    , plugin_patch_version INTEGER NOT NULL
    , prompt TEXT not null
    , create_at TIMESTAMP (6) without time zone not null
    , update_at TIMESTAMP (6) without time zone
    , primary key (service_div, plugin_major_version, plugin_minor_version, plugin_patch_version)
);


-- 論理名／コメントの設定
comment on table m_prompt is 'プロンプトテーブル';
comment on column m_prompt.service_div is 'サービス区分:サービス（JS生成、アプリ作成）を区別するため区分';
comment on column m_prompt.plugin_major_version is 'プラグインメジャーバージョン:プラグインバージョン（X.Y.Z表記）のメジャーバージョン（X箇所）';
comment on column m_prompt.plugin_minor_version is 'プラグインマイナーバージョン:プラグインバージョン（X.Y.Z表記）のマイナーバージョン（Y箇所）';
comment on column m_prompt.plugin_patch_version is 'プラグインパッチバージョン:プラグインバージョン（X.Y.Z表記）のパッチバージョン（Z箇所）';
comment on column m_prompt.prompt is 'プロンプト';
comment on column m_prompt.create_at is '登録日時';
comment on column m_prompt.update_at is '更新日時';
