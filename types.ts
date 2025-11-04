
export interface Similarity {
  sourceText: string;
  checkedText: string;
  explanation: string;
}

export interface WebSource {
  uri: string;
  title: string;
}

export interface PlagiarismResult {
  overallSimilarityPercentage: number;
  summary: string;
  similarities: Similarity[];
  webSources?: WebSource[];
}
