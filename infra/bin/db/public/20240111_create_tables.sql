-- プラグインバージョン管理テーブル
CREATE TABLE IF NOT EXISTS plugin_versions (
    major_version INTEGER NOT NULL,
    minor_version INTEGER NOT NULL,
    patch_version INTEGER NOT NULL,
    comment TEXT,
    is_disabled BOOLEAN DEFAULT FALSE NOT NULL,
    disabled_date DATE,
    created_at TIMESTAMP(6) WITHOUT TIME zone NOT NULL,
    update_at timestamp(6) WITHOUT TIME zone,
    PRIMARY KEY (major_version, minor_version, patch_version)
);