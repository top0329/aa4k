-- テーブル名の変更
ALTER TABLE t_langchain_process_logs RENAME TO t_langchain_log_js_gen;

-- 論理名／コメントの設定
comment on table t_langchain_log_js_gen is 'JS生成_LangChainログテーブル';