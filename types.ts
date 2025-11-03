export interface TimeComplexity {
  best: string;
  average: string;
  worst: string;
}

export interface RelatedAlgorithm {
  name: string;
  reason: string;
}

export interface AlgorithmSuggestion {
  algorithmName: string;
  dataStructures: string[];
  description: string;
  timeComplexity: TimeComplexity;
  spaceComplexity: string;
  useCase: string;
  cCodeSnippet: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  relatedAlgorithms: RelatedAlgorithm[];
  mermaidFlowchart: string;
}

export interface AdvisorResponse {
  recommendations: AlgorithmSuggestion[];
  summary: string;
}

// NEW: Type for chat messages
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// NEW: Type for grounded search results
export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}
