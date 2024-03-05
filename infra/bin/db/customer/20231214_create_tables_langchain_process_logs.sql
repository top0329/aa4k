-- LangChain実行ログテーブル
CREATE TABLE IF NOT EXISTS t_langchain_process_logs( 
    id bigserial
    , subscription_id varchar (36)
    , app_id text
    , user_id text
    , session_id varchar (36)
    , conversation_id bigint
    , handle_name varchar (50)
    , run_name varchar (50)
    , run_id varchar (36)
    , parent_run_id varchar (36)
    , content text
    , metadata_langchain_params text
    , metadata_extra_params text
    , tokens integer
    , execute_date timestamp
    , create_date timestamp
    , created_on date default current_date not null
    , primary key (id, created_on)
) partition by
    range (created_on);

-- 論理名／コメントの設定
comment on table t_langchain_process_logs is 'LangChain実行ログテーブル';
comment on column t_langchain_process_logs.id is 'ID:自動採番';
comment on column t_langchain_process_logs.subscription_id is 'サブスクリプションID:顧客を識別するID';
comment on column t_langchain_process_logs.app_id is 'アプリID:KintoneのアプリID';
comment on column t_langchain_process_logs.user_id is 'ユーザID:Kintoneのユーザー ID';
comment on column t_langchain_process_logs.session_id is 'セッションID:一連の操作を区別するためのID（＝ 一回の発言を結びつける）';
comment on column t_langchain_process_logs.conversation_id is '会話履歴ID:コードチェックの場合はNULL';
comment on column t_langchain_process_logs.handle_name is 'ハンドル名:Langchainのハンドル名';
comment on column t_langchain_process_logs.run_name is '実行名:実行処理名（AgentExecutor、LLMChain、OpenAIChat、ChatOpenAIなど）';
comment on column t_langchain_process_logs.run_id is '実行ID:実行処理ごとのID';
comment on column t_langchain_process_logs.parent_run_id is '親実行ID:親の実行処理ID（Agents配下で実行されるやつは親実行IDにAgentsの実行IDが設定される）';
comment on column t_langchain_process_logs.content is '内容:処理の主たるinput, outputの情報

例)
handleLLMStart → 入力プロンプト
handleLLMEnd → 生成文章
handleRetrieverStart → Retrieverに渡すquery
handleRetrieverEnd → Retrieverから受け取ったdocuments
※text型:最大1GB';
comment on column t_langchain_process_logs.metadata_langchain_params is 'メタデータ_LangChainパラメータ:Langchainで指定したパラメータ';
comment on column t_langchain_process_logs.metadata_extra_params is 'メタデータ_その他パラメータ:外部APIに渡しているパラメータ（LangchainのextraParamsを格納）';
comment on column t_langchain_process_logs.tokens is 'トークン数:input or outputのトークン数';
comment on column t_langchain_process_logs.execute_date is '実行日時';
comment on column t_langchain_process_logs.create_date is '作成日時';
comment on column t_langchain_process_logs.created_on is '作成日:パーティションキーにするためにPKにする';