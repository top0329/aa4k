-- langChain_Embeddingテーブル
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS langchain_embedding (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    "content" text,
    "metadata" jsonb,
    "vector" vector
);


-- langChain_Embedding_Collectionテーブル
CREATE TABLE IF NOT EXISTS langchain_embedding_collection (
    uuid uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    name character varying,
    cmetadata jsonb
);
ALTER TABLE langchain_embedding
    ADD COLUMN collection_id uuid
;
ALTER TABLE langchain_embedding
    ADD CONSTRAINT langchain_embedding_collection_id_fkey
    FOREIGN KEY (collection_id)
    REFERENCES langchain_embedding_collection(uuid)
    ON DELETE CASCADE
;


-- テンプレートコードテーブル
CREATE TABLE IF NOT EXISTS template_code (
    template_code_id varchar(36),
    template_code text,
    create_at timestamp,
    update_at timestamp
);
