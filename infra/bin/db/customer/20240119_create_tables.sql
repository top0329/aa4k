-- 会話履歴テーブル
CREATE TABLE IF NOT EXISTS conversation_history (
    id bigserial NOT NULL,
    app_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    device_div CHARACTER VARYING (20) NOT NULL,
    user_message TEXT,
    ai_message TEXT,
    ai_message_additional TEXT,
    javascript_code TEXT,
    user_rating CHARACTER (1),
    user_message_at TIMESTAMP(6) WITHOUT TIME zone,
    ai_message_at TIMESTAMP(6) WITHOUT TIME zone,
    created_on DATE DEFAULT CURRENT_DATE NOT NULL,
    PRIMARY KEY (id, created_on)
) PARTITION BY RANGE (created_on);