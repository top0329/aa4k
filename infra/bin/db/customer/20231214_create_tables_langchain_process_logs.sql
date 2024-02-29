-- LangChain実行ログテーブル
CREATE TABLE IF NOT EXISTS langchain_process_logs (
    id bigserial,
    subscription_id varchar(36),
    app_id text,
    user_id text,
    session_id varchar(36),
    conversation_id bigint,
    handle_name varchar(50),
    run_name varchar(50),
    run_id varchar(36),
    parent_run_id varchar(36),
    content text,
    metadata_langchain_params text,
    metadata_extra_params text,
    tokens integer,
    execute_date timestamp,
    create_date timestamp,
    created_on date default current_date not null,
    primary key (id, created_on)
) partition by range (created_on);