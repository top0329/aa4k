-- プラグインバージョン管理テーブル
CREATE TABLE IF NOT EXISTS m_plugin_version( 
    major_version INTEGER NOT NULL
    , minor_version INTEGER NOT NULL
    , patch_version INTEGER NOT NULL
    , comment TEXT
    , is_disabled BOOLEAN DEFAULT FALSE NOT NULL
    , disabled_date DATE
    , created_at TIMESTAMP (6) WITHOUT TIME zone NOT NULL
    , update_at timestamp (6) WITHOUT TIME zone
    , PRIMARY KEY (major_version, minor_version, patch_version)
);

-- 論理名／コメントの設定
comment on table m_plugin_version is 'プラグインバージョン管理テーブル';
comment on column m_plugin_version.major_version is 'メジャーバージョン:プラグインバージョン（X.Y.Z表記）のメジャーバージョン（X箇所）
・見た目や操作性（UI）に影響を及ぼすようなシステム自体の大規模アップデートの場合、バージョンを上げる';
comment on column m_plugin_version.minor_version is 'マイナーバージョン:プラグインバージョン（X.Y.Z表記）のマイナーバージョン（Y箇所）
・細かな追加機能の実装や部分的な情報追加・修正といったソフトウェア内の仕様変更の場合、バージョンを上げる';
comment on column m_plugin_version.patch_version is 'パッチバージョン:プラグインバージョン（X.Y.Z表記）のパッチバージョン（Z箇所）
・不具合等の軽微なバグの修正や誤字脱字の訂正、注釈表現の変更などの場合、バージョンを上げる';
comment on column m_plugin_version.comment is 'コメント:対象プラグインバージョンのコメント';
comment on column m_plugin_version.is_disabled is '無効状態:true：無効状態、false：有効状態';
comment on column m_plugin_version.disabled_date is '無効日:対象プラグインバージョンを無効にした日付';
comment on column m_plugin_version.created_at is '登録日時';
comment on column m_plugin_version.update_at is '更新日時';
