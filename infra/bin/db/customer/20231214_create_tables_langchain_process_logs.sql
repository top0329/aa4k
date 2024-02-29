-- LangChain実行ログテーブル
CREATE TABLE LANGCHAIN_PROCESS_LOGS (
    ID bigserial PRIMARY KEY,
    SUBSCRIPTION_ID varchar(36),
    HISTORY_ID varchar(36),
    SESSION_ID varchar(36),
    HANDLE_NAME varchar(50),
    RUN_NAME varchar(50),
    RUN_ID varchar(36),
    PARENT_RUN_ID varchar(36),
    CONTENT text,
    METADATA_LANGCHAIN_PARAMS text,
    METADATA_EXTRA_PARAMS text,
    TOKENS integer,
    EXECUTE_DATE timestamp,
    CREATE_DATE timestamp
);