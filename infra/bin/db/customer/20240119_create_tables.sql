-- 会話履歴テーブル
CREATE TABLE IF NOT EXISTS t_conversation_history( 
    id bigserial NOT NULL
    , app_id TEXT NOT NULL
    , user_id TEXT NOT NULL
    , device_div CHARACTER VARYING (20) NOT NULL
    , user_message TEXT
    , ai_message TEXT
    , ai_message_comment TEXT
    , error_message TEXT
    , javascript_code TEXT
    , user_rating CHARACTER VARYING (20)
    , user_rating_comment TEXT
    , user_message_at TIMESTAMP (6) WITHOUT TIME zone
    , ai_message_at TIMESTAMP (6) WITHOUT TIME zone
    , error_message_at TIMESTAMP (6) WITHOUT TIME zone
    , created_on DATE DEFAULT CURRENT_DATE NOT NULL
    , PRIMARY KEY (id, created_on)
) PARTITION BY
    RANGE (created_on);

-- 論理名／コメントの設定
comment on table t_conversation_history is '会話履歴テーブル';
comment on column t_conversation_history.id is 'ID:自動採番';
comment on column t_conversation_history.app_id is 'アプリID:KintoneのアプリID';
comment on column t_conversation_history.user_id is 'ユーザーID:Kintoneのユーザー ID';
comment on column t_conversation_history.device_div is 'デバイス区分:desktop:PC用 、mobile:スマホ用:';
comment on column t_conversation_history.user_message is 'ユーザー発言:※AI回答あれば過去履歴としてLLMに渡す対象';
comment on column t_conversation_history.ai_message is 'AI回答:※AI回答あれば過去履歴としてLLMに渡す対象';
comment on column t_conversation_history.ai_message_comment is 'AI回答コメント:※AI回答あれば過去履歴としてLLMに渡す対象';
comment on column t_conversation_history.error_message is 'エラーメッセージ:画面表示のみに利用（LLMに渡さない）';
comment on column t_conversation_history.javascript_code is '生成JSコード';
comment on column t_conversation_history.user_rating is 'ユーザー評価:good、bad';
comment on column t_conversation_history.user_rating_comment is 'ユーザー評価コメント';
comment on column t_conversation_history.user_message_at is 'ユーザー発言日時';
comment on column t_conversation_history.ai_message_at is 'AI発言日時';
comment on column t_conversation_history.error_message_at is 'エラーメッセージ発言日時';
comment on column t_conversation_history.created_on is '作成日:パーティションキーにするためにPKにする';