import { Document } from "@langchain/core/documents";
import { BaseRetriever, BaseRetrieverInput } from "@langchain/core/retrievers"
import { PGVectorStore } from "langchain/vectorstores/pgvector";

/**
 * pgvectorレトリバー
 *     類似性スコアによる対象の絞り込みを行うため独自のRetrieverを用意
 */
export class PgVectorRetriever extends BaseRetriever {
  pgvectorStore: PGVectorStore;
  threshold: number;
  k?: number;

  get lc_namespace() {
    return ["langchain", "retrievers", "base"];
  }
  constructor(pgvectorStore: PGVectorStore, threshold: number, k?: number, fields?: BaseRetrieverInput) {
    super(fields);
    this.pgvectorStore = pgvectorStore;
    this.threshold = threshold;
    this.k = k;
  };

  async getRelevantDocuments(query: string): Promise<Document[]> {
    const pgVectorDocuments = await this.getPgVectorDocuments(query, this.pgvectorStore, this.threshold, this.k);
    return pgVectorDocuments;
  }

  /**
   * pgVector検索
   * @param query 
   * @returns 
   */
  async getPgVectorDocuments(query: string, pgvectorStore: PGVectorStore, threshold: number, k?: number): Promise<Document[]> {
    // pgvectorStoreを使用して検索
    const documents = await pgvectorStore.similaritySearchWithScore(query, k);

    // スコアが閾値未満のものを返却
    return documents
      .filter(([_doc, score]) => score < threshold)
      .map(([doc, _score]) => new Document(doc));
  }
}


