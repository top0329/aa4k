-- プロンプト_FunctionCallingパラメータテーブル
CREATE TABLE IF NOT EXISTS m_prompt_fc (
    service_div VARCHAR(20) NOT NULL
    , plugin_major_version INTEGER NOT NULL
    , plugin_minor_version INTEGER NOT NULL
    , plugin_patch_version INTEGER NOT NULL
    , item_id INTEGER NOT NULL
    , parent_item_id INTEGER
    , item_name TEXT NOT NULL
    , item_type VARCHAR(20) NOT NULL
    , item_describe TEXT NOT NULL
    , constants TEXT
    , create_at TIMESTAMP (6) without time zone not null
    , update_at TIMESTAMP (6) without time zone
    , PRIMARY KEY (service_div, plugin_major_version, plugin_minor_version, plugin_patch_version, item_id)
    , CONSTRAINT fk_parent_item_id FOREIGN KEY (service_div, plugin_major_version, plugin_minor_version, plugin_patch_version, parent_item_id) REFERENCES m_prompt_fc(service_div, plugin_major_version, plugin_minor_version, plugin_patch_version, item_id)
);

-- 論理名／コメントの設定
comment on table m_prompt_fc is 'プロンプト_FunctionCallingパラメータテーブル';
comment on column m_prompt_fc.service_div is 'サービス区分:サービス（JS生成、アプリ作成など）を区別するため区分';
comment on column m_prompt_fc.plugin_major_version is 'プラグインメジャーバージョン:プラグインバージョン（X.Y.Z表記）のメジャーバージョン（X箇所）';
comment on column m_prompt_fc.plugin_minor_version is 'プラグインマイナーバージョン:プラグインバージョン（X.Y.Z表記）のマイナーバージョン（Y箇所）';
comment on column m_prompt_fc.plugin_patch_version is 'プラグインパッチバージョン:プラグインバージョン（X.Y.Z表記）のパッチバージョン（Z箇所）';
comment on column m_prompt_fc.item_id is '項目ID:項目を特定するためのID';
comment on column m_prompt_fc.parent_item_id is '親項目ID:親となる項目ID（object配下の項目の場合に設定）';
comment on column m_prompt_fc.item_name is '項目名称:パラメータ項目の名称';
comment on column m_prompt_fc.item_type is '項目タイプ:number, string, objectなど型';
comment on column m_prompt_fc.item_describe is '項目説明:パラメータ項目の説明';
comment on column m_prompt_fc.constants is '定数';
comment on column m_prompt_fc.create_at is '登録日時';
comment on column m_prompt_fc.update_at is '更新日時';
