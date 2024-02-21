-- 会話履歴テーブル
CREATE TABLE IF NOT EXISTS conversation_history (
    id bigserial NOT NULL,
    app_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    device_div CHARACTER VARYING (20) NOT NULL,
    user_message TEXT,
    ai_message TEXT,
    ai_message_comment TEXT,
    error_message TEXT,
    javascript_code TEXT,
    user_rating CHARACTER VARYING (20),
    user_rating_comment TEXT,
    user_message_at TIMESTAMP(6) WITHOUT TIME zone,
    ai_message_at TIMESTAMP(6) WITHOUT TIME zone,
    error_message_at TIMESTAMP(6) WITHOUT TIME zone,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    PRIMARY KEY (id, created_on)
) PARTITION BY RANGE (created_on);