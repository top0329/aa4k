import { BaseRetrieverInterface, BaseRetriever, BaseRetrieverInput } from "@langchain/core/retrievers";
import { Document } from "@langchain/core/documents";
import { CallbackManagerForRetrieverRun } from "langchain/callbacks";
import { InvalidOpenAiApiKeyError } from "./errors"

/**
 * Interface for configuring an EnsembleRetriever instance.
 */
export interface EnsembleRetrieverConfig extends BaseRetrieverInput {
  retrievers: BaseRetrieverInterface[];
  weights?: number[];
  c?: number;
}

/**
 * EnsembleRetriever that combines the results of multiple retrievers
 * using weighted Reciprocal Rank Fusion.
 * Args:
    retrievers: A list of retrievers to ensemble.
    weights: A list of weights corresponding to the retrievers. Defaults to equal
        weighting for all retrievers.
    c: A constant added to the rank, controlling the balance between the importance
        of high-ranked items and the consideration given to lower-ranked items.
        Default is 60.
 */
export class EnsembleRetriever extends BaseRetriever {
  static lc_name() {
    return "EnsembleRetriever";
  }

  lc_namespace = ["langchain", "retrievers", "ensemble"];

  retrievers: BaseRetrieverInterface[];
  weights: number[];
  c: number;

  constructor(fields: EnsembleRetrieverConfig) {
    super(fields);
    this.retrievers = fields.retrievers;
    this.weights = fields.weights ?? new Array(fields.retrievers.length).fill(1 / fields.retrievers.length);
    this.c = fields.c ?? 60;
  }

  async _getRelevantDocuments(query: string, runManager?: CallbackManagerForRetrieverRun): Promise<Document[]> {

    // Use rank fusion to aggregate results.
    const results = await this.rankFusion(query, runManager);

    return results;
  }

  private async rankFusion(query: string, runManager?: CallbackManagerForRetrieverRun): Promise<Document[]> {
    // Asynchronously invoke all retrievers with the query and collect their results.
    let errCount = 0;
    const retrieverResults = await Promise.all(this.retrievers.map((retriever, index) =>
      retriever.getRelevantDocuments(query, runManager?.getChild(`retriever_${index + 1}`))
        .catch((err) => {
          errCount++;
          if (err instanceof InvalidOpenAiApiKeyError) throw err;
          if (this.retrievers.length == errCount) throw err
          return []
        })
    ));

    // Enforce that retrieved docs are Documents for each list in retriever_docs
    for (let i = 0; i < retrieverResults.length; i++) {
      retrieverResults[i] = retrieverResults[i].map(doc =>
        !(doc instanceof Document) ? new Document({ ...doc }) : doc
      );
    }

    // Apply weighted reciprocal rank fusion on the collected results.
    return this.weightedReciprocalRank(retrieverResults);
  }

  private weightedReciprocalRank(docLists: Document[][]): Document[] {
    if (docLists.length !== this.weights.length) {
      throw new Error("Number of rank lists must be equal to the number of weights.");
    }

    // Make page content set
    const allPageContent = new Set(docLists.flatMap(docList => docList.map(doc => doc.pageContent)));

    // Make rrf score record
    let rrfScoreRecord: Record<string, number> = {};
    allPageContent.forEach(content => rrfScoreRecord[content] = 0.0); // initialize for score 0.0
    // Calculate reciprocal rank score
    for (let i = 0; i < docLists.length; i++) {
      let docList = docLists[i];
      let weight = this.weights[i];
      for (let rank = 0; rank < docList.length; rank++) {
        let doc = docList[rank];
        let rrfScore = weight * (1 / (rank + 1 + this.c));
        rrfScoreRecord[doc.pageContent] += rrfScore;
      }
    }

    // Make record for converting from page content to document
    let pageContentToDocMap: Record<string, Document> = {};
    docLists.forEach(docList => {
      docList.forEach(doc => {
        pageContentToDocMap[doc.pageContent] = doc;
      })
    })

    // rerank based with rrf score
    const sortedDocuments = Array.from(allPageContent).sort((a, b) => rrfScoreRecord[b] - rrfScoreRecord[a]);

    // Convert from page content to document
    const sortedDocs = sortedDocuments.map(pageContent => pageContentToDocMap[pageContent]);
    return sortedDocs;
  }
}