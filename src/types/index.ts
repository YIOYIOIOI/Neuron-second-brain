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
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  relatedKnowledgeIds?: string[];
}

export type ThemeMode = 'light' | 'dark' | 'system';
