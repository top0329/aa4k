import { Document } from "@langchain/core/documents";
import { BaseRetriever, BaseRetrieverInput } from "langchain/schema/retriever";
import { CodeTemplateRetrieverResponse } from "../../types/ai"

export class CodeTemplateRetriever extends BaseRetriever {
  k: number;
  threshold: number;

  get lc_namespace() {
    return ["langchain", "retrievers", "base"];
  }
  constructor(k: number, threshold: number, fields?: BaseRetrieverInput) {
    super(fields);
    this.k = k;
    this.threshold = threshold;
  };

  async getRelevantDocuments(query: string): Promise<Document[]> {
    // TODO: 「kintone.plugin.app.proxy」でAPI連携する必要がある（プラグイン開発としての準備が整っていないため暫定的に「kintone.proxy」を使用
    const response = await kintone.proxy(
      `${import.meta.env.VITE_API_ENDPOINT}/code_template/retrieve`,
      "POST",
      { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
      {
        query: query,
        k: this.k,
      },
    );
    const resJson = JSON.parse(response[0]) as CodeTemplateRetrieverResponse;

    const documents = resJson.documents;
    const resultDocuments = documents
      .filter(([_doc, score]) => score < this.threshold)
      .map(([doc, _score]) => {
        const metaData = doc.metadata;
        return new Document(metaData.templateCode)
      });

    return resultDocuments;
  }
}
