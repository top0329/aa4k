import { DocumentInterface } from "@langchain/core/documents";
import { BaseRetriever } from "langchain/schema/retriever";
import { Document } from "langchain/document";

export class CodeTemplateRetriever extends BaseRetriever {
  get lc_namespace() {
    return ["langchain", "retrievers", "base"];
  }

  async getRelevantDocuments(query: string): Promise<Document[]> {
    // TODO: 「kintone.plugin.app.proxy」でAPI連携する必要がある（プラグイン開発としての準備が整っていないため暫定的に「kintone.proxy」を使用
    const response = await kintone.proxy(
      `${import.meta.env.VITE_API_ENDPOINT}/code_template/retrieve`,
      "POST",
      { "aa4k-plugin-version": "1.0.0", "aa4k-subscription-id": "2c2a93dc-4418-ba88-0f89-6249767be821" }, // TODO: 暫定的に設定、本来はkintoneプラグインで自動的に設定される
      {
        query: query,
        k: 30,
      },
    );
    const resJson = JSON.parse(response[0]);

    const documents = resJson.documents as [DocumentInterface, number][];
    const resultDocuments = documents
      .filter((document: [DocumentInterface, number]) => document[1] < 0.2)
      .map((document: [DocumentInterface, number]) => {
        const metaData = document[0].metadata;
        return metaData.templateCode;
      }) as Document[];

    return resultDocuments as Document[];
  }
}
