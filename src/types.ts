export interface ContentItem {
  id: string;
  title: string;
  content: string;
  placeholder: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ContentModule {
  id: string;
  title: string;
  description: string;
  systemPrompt: string;
} 