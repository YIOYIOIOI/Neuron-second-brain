export interface KnowledgeVersion {
  content: string;
  title: string;
  tags: string[];
  updatedAt: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  isFolder: true;
  children: string[];
  createdAt: string;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  summary: string;
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  relatedIds: string[];
  references?: string[];
  backlinks?: string[];
  embedding?: number[];
  versions?: KnowledgeVersion[];
  importanceScore?: number;
  accessCount?: number;
  isMilestone?: boolean;
  folderId?: string | null;
  type?: 'note' | 'concept';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  relatedKnowledgeIds?: string[];
}

export interface ReviewCard {
  id: string;
  question: string;
  answer: string;
  sourceKnowledgeId: string;
  deckId: string;
  createdAt: string;
  nextReviewDate: string;
  reviewCount: number;
  easeFactor: number;
}

export interface ReviewDeck {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  cardCount: number;
}

export type ThemeMode = 'light' | 'dark' | 'system';
