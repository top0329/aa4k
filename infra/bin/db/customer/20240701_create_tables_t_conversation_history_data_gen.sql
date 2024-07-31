-- データ生成_会話履歴テーブル
CREATE TABLE IF NOT EXISTS t_conversation_history_data_gen( 
    id bigserial NOT NULL
    , subscription_id CHARACTER VARYING (36) NOT NULL
    , app_id TEXT NOT NULL
    , user_id TEXT NOT NULL
    , user_message TEXT
    , ai_message TEXT
    , error_message TEXT
    , generated_data TEXT
    , user_message_at TIMESTAMP (6) WITHOUT TIME zone
    , ai_message_at TIMESTAMP (6) WITHOUT TIME zone
    , error_message_at TIMESTAMP (6) WITHOUT TIME zone
    , clear_at TIMESTAMP (6) WITHOUT TIME zone
    , created_on DATE DEFAULT CURRENT_DATE NOT NULL
    , PRIMARY KEY (id, created_on)
) PARTITION BY
    RANGE (created_on);

-- 論理名／コメントの設定
comment on table t_conversation_history_data_gen is 'データ生成_会話履歴テーブル';
comment on column t_conversation_history_data_gen.id is 'ID:自動採番';
comment on column t_conversation_history_data_gen.subscription_id is 'サブスクリプションID:集計用のキー項目として使用';
comment on column t_conversation_history_data_gen.app_id is 'アプリID:KintoneのアプリID';
comment on column t_conversation_history_data_gen.user_id is 'ユーザーID:Kintoneのユーザー ID';
comment on column t_conversation_history_data_gen.user_message is 'ユーザー発言:※AI回答あれば過去履歴としてLLMに渡す対象';
comment on column t_conversation_history_data_gen.ai_message is 'AI回答:※AI回答あれば過去履歴としてLLMに渡す対象';
comment on column t_conversation_history_data_gen.error_message is 'エラーメッセージ:画面表示のみに利用（LLMに渡さない）';
comment on column t_conversation_history_data_gen.generated_data is '生成データ';
comment on column t_conversation_history_data_gen.user_message_at is 'ユーザー発言日時';
comment on column t_conversation_history_data_gen.ai_message_at is 'AI発言日時';
comment on column t_conversation_history_data_gen.error_message_at is 'エラーメッセージ発言日時';
comment on column t_conversation_history_data_gen.clear_at is 'クリア日時:会話履歴をクリアした日時';
comment on column t_conversation_history_data_gen.created_on is '作成日:パーティションキーにするためにPKにする';