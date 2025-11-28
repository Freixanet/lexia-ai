export interface Source {
  title?: string;
  uri: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
  timestamp: number;
  sources?: Source[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

export enum ModelType {
  FAST = 'gemini-2.5-flash',
  REASONING = 'gemini-3-pro-preview',
}