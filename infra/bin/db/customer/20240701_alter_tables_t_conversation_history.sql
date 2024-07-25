-- テーブル名の変更
ALTER TABLE t_conversation_history RENAME TO t_conversation_history_js_gen;

-- カラム追加
ALTER TABLE t_conversation_history_js_gen ADD COLUMN subscription_id character varying (36);

-- 論理名／コメントの設定
comment on table t_conversation_history_js_gen is 'JS生成_会話履歴テーブル';
comment on column t_conversation_history_js_gen.subscription_id is 'サブスクリプションID:集計用のキー項目として使用';
