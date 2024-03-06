-- m_langChain_Embeddingテーブル
CREATE EXTENSION IF NOT EXISTS vector; 
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 
CREATE TABLE IF NOT EXISTS m_langchain_embedding( 
    "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY
    , "content" text
    , "metadata" jsonb
    , "vector" vector
);

-- 論理名／コメントの設定
comment on table m_langchain_embedding is 'langChain_Embeddingテーブル';
comment on column m_langchain_embedding.id is 'ID';
comment on column m_langchain_embedding.content is 'コンテンツ';
comment on column m_langchain_embedding.metadata is 'メタデータ';
comment on column m_langchain_embedding.vector is 'ベクトルデータ';



-- m_langChain_Embedding_Collectionテーブル
CREATE TABLE IF NOT EXISTS m_langchain_embedding_collection( 
    uuid uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY
    , name character varying
    , cmetadata jsonb
);
ALTER TABLE m_langchain_embedding
    ADD COLUMN collection_id uuid
;
ALTER TABLE m_langchain_embedding
    ADD CONSTRAINT m_langchain_embedding_collection_id_fkey
    FOREIGN KEY (collection_id)
    REFERENCES m_langchain_embedding_collection(uuid)
    ON DELETE CASCADE
;

-- 論理名／コメントの設定
comment on table m_langchain_embedding_collection is 'langChain_Embedding_Collectionテーブル';
comment on column m_langchain_embedding_collection.uuid is 'uuid';
comment on column m_langchain_embedding_collection.name is '名前';
comment on column m_langchain_embedding_collection.cmetadata is 'メタデータ';


-- テンプレートコードテーブル
CREATE TABLE IF NOT EXISTS m_template_code( 
    template_code_id varchar (36) not null
    , template_code text not null
    , create_at timestamp not null
    , update_at timestamp
    , primary key (template_code_id)
);


-- 論理名／コメントの設定
comment on table m_template_code is 'テンプレートコードテーブル';
comment on column m_template_code.template_code_id is 'テンプレートコードID:テンプレートコードごとのID（UUID）';
comment on column m_template_code.template_code is 'テンプレートコード';
comment on column m_template_code.create_at is '作成日時';
comment on column m_template_code.update_at is '更新日時';
