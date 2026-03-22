import { create } from 'zustand';
import { KnowledgeItem, ChatMessage, FolderItem, ThemeMode, ReviewDeck, ReviewCard } from '../types';
import { mockKnowledgeBase } from '../mock/data';
import { Language } from '../i18n';

interface StoreState {
  knowledgeList: KnowledgeItem[];
  searchQuery: string;
  selectedTags: string[];
  chatMessages: ChatMessage[];
  user: string | null;
  language: Language;
  editorState: string;
  selectedKnowledge: string[];
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  folders: FolderItem[];
  activeFolderId: string | null;
  pinnedCards: Array<{ id: string; title: string; summary: string }>;
  smoothCursor: boolean;
  knowledgeTypeFilter: 'all' | 'note' | 'concept';
  reviewDecks: ReviewDeck[];
  reviewCards: ReviewCard[];
  activeReviewDeckId: string | null;
  reviewCompletionState: Record<string, { completed: boolean; date: string }>;

  // Actions
  addKnowledge: (item: KnowledgeItem) => void;
  updateKnowledge: (id: string, updates: Partial<KnowledgeItem>) => void;
  incrementAccessCount: (id: string) => void;
  setSearchQuery: (query: string) => void;
  toggleTag: (tag: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  updateLastChatMessage: (content: string) => void;
  login: (username: string) => void;
  logout: () => void;
  setLanguage: (lang: Language) => void;
  setEditorState: (state: { content: string; isOpen: boolean }) => void;
  toggleSelectedKnowledge: (id: string) => void;
  toggleSidebar: () => void;
  importKnowledge: (items: KnowledgeItem[]) => void;
  deleteKnowledge: (id: string) => void;
  clearAllKnowledge: () => void;
  setTheme: (theme: ThemeMode) => void;
  addFolder: (folder: FolderItem) => void;
  updateFolder: (id: string, updates: Partial<FolderItem>) => void;
  deleteFolder: (id: string) => void;
  setActiveFolderId: (id: string | null) => void;
  moveKnowledgeToFolder: (knowledgeId: string, folderId: string | null) => void;
  pinCard: (card: { id: string; title: string; summary: string }) => void;
  unpinCard: (id: string) => void;
  setSmoothCursor: (enabled: boolean) => void;
  setKnowledgeTypeFilter: (filter: 'all' | 'note' | 'concept') => void;
  addReviewDeck: (deck: ReviewDeck) => void;
  deleteReviewDeck: (id: string) => void;
  setActiveReviewDeckId: (id: string | null) => void;
  addReviewCard: (card: ReviewCard) => void;
  updateReviewCard: (id: string, updates: Partial<ReviewCard>) => void;
  deleteReviewCard: (id: string) => void;
  setReviewCompleted: (deckId: string, completed: boolean) => void;
  isReviewCompletedToday: (deckId: string) => boolean;
}

export const useStore = create<StoreState>((set) => ({
  knowledgeList: mockKnowledgeBase,
  searchQuery: '',
  selectedTags: [],
  chatMessages: [
    { id: '1', role: 'ai', content: 'How can I assist you with your knowledge base today?' }
  ],
  user: localStorage.getItem('user'),
  language: (localStorage.getItem('language') as Language) || 'zh',
  editorState: '',
  selectedKnowledge: [],
  sidebarCollapsed: false,
  theme: (localStorage.getItem('theme') as ThemeMode) || 'light',
  folders: JSON.parse(localStorage.getItem('folders') || '[]'),
  activeFolderId: null,
  pinnedCards: [],
  smoothCursor: localStorage.getItem('smoothCursor') === 'true',
  knowledgeTypeFilter: 'all',
  reviewDecks: JSON.parse(localStorage.getItem('reviewDecks') || '[]'),
  reviewCards: JSON.parse(localStorage.getItem('reviewCards') || '[]'),
  activeReviewDeckId: null,
  reviewCompletionState: JSON.parse(localStorage.getItem('reviewCompletionState') || '{}'),

  addKnowledge: (item) => set((state) => ({ knowledgeList: [item, ...state.knowledgeList] })),
  updateKnowledge: (id, updates) => set((state) => ({
    knowledgeList: state.knowledgeList.map(item =>
      item.id === id ? { ...item, ...updates } : item
    )
  })),
  incrementAccessCount: (id) => set((state) => ({
    knowledgeList: state.knowledgeList.map(item =>
      item.id === id ? { ...item, accessCount: (item.accessCount || 0) + 1 } : item
    )
  })),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleTag: (tag) => set((state) => {
    const tags = state.selectedTags.includes(tag)
      ? state.selectedTags.filter(t => t !== tag)
      : [...state.selectedTags, tag];
    return { selectedTags: tags };
  }),
  addChatMessage: (message) => set((state) => ({ chatMessages: [...state.chatMessages, message] })),
  updateLastChatMessage: (content) => set((state) => {
    const messages = [...state.chatMessages];
    if (messages.length > 0) {
      messages[messages.length - 1].content = content;
    }
    return { chatMessages: messages };
  }),
  login: (username) => {
    localStorage.setItem('user', username);
    set({ user: username });
  },
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    set({ language: lang });
  },
  setEditorState: (content) => set({ editorState: content }),
  toggleSelectedKnowledge: (id) => set((state) => {
    const selected = state.selectedKnowledge.includes(id)
      ? state.selectedKnowledge.filter(kId => kId !== id)
      : [...state.selectedKnowledge, id];
    return { selectedKnowledge: selected };
  }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  importKnowledge: (items) => set((state) => {
    const existingIds = new Set(state.knowledgeList.map(k => k.id));
    const newItems = items.filter(item => !existingIds.has(item.id));
    return { knowledgeList: [...newItems, ...state.knowledgeList] };
  }),
  deleteKnowledge: (id) => set((state) => ({
    knowledgeList: state.knowledgeList.filter(item => item.id !== id)
  })),
  clearAllKnowledge: () => set({ knowledgeList: [] }),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },
  addFolder: (folder) => set((state) => {
    const newFolders = [...state.folders, folder];
    localStorage.setItem('folders', JSON.stringify(newFolders));
    return { folders: newFolders };
  }),
  updateFolder: (id, updates) => set((state) => {
    const newFolders = state.folders.map(f => f.id === id ? { ...f, ...updates } : f);
    localStorage.setItem('folders', JSON.stringify(newFolders));
    return { folders: newFolders };
  }),
  deleteFolder: (id) => set((state) => {
    const newFolders = state.folders.filter(f => f.id !== id);
    localStorage.setItem('folders', JSON.stringify(newFolders));
    return { folders: newFolders };
  }),
  setActiveFolderId: (id) => set({ activeFolderId: id }),
  moveKnowledgeToFolder: (knowledgeId, folderId) => set((state) => ({
    knowledgeList: state.knowledgeList.map(item =>
      item.id === knowledgeId ? { ...item, folderId } : item
    )
  })),
  pinCard: (card) => set((state) => {
    if (state.pinnedCards.some(c => c.id === card.id)) return state;
    return { pinnedCards: [...state.pinnedCards, card] };
  }),
  unpinCard: (id) => set((state) => ({
    pinnedCards: state.pinnedCards.filter(c => c.id !== id)
  })),
  setSmoothCursor: (enabled) => {
    localStorage.setItem('smoothCursor', String(enabled));
    return set({ smoothCursor: enabled });
  },
  setKnowledgeTypeFilter: (filter) => set({ knowledgeTypeFilter: filter }),
  addReviewDeck: (deck) => set((state) => {
    const newDecks = [...state.reviewDecks, deck];
    localStorage.setItem('reviewDecks', JSON.stringify(newDecks));
    return { reviewDecks: newDecks };
  }),
  deleteReviewDeck: (id) => set((state) => {
    const newDecks = state.reviewDecks.filter(d => d.id !== id);
    const newCards = state.reviewCards.filter(c => c.deckId !== id);
    localStorage.setItem('reviewDecks', JSON.stringify(newDecks));
    localStorage.setItem('reviewCards', JSON.stringify(newCards));
    return { reviewDecks: newDecks, reviewCards: newCards };
  }),
  setActiveReviewDeckId: (id) => set({ activeReviewDeckId: id }),
  addReviewCard: (card) => set((state) => {
    const newCards = [...state.reviewCards, card];
    localStorage.setItem('reviewCards', JSON.stringify(newCards));
    return { reviewCards: newCards };
  }),
  updateReviewCard: (id, updates) => set((state) => {
    const newCards = state.reviewCards.map(c => c.id === id ? { ...c, ...updates } : c);
    localStorage.setItem('reviewCards', JSON.stringify(newCards));
    return { reviewCards: newCards };
  }),
  deleteReviewCard: (id) => set((state) => {
    const newCards = state.reviewCards.filter(c => c.id !== id);
    localStorage.setItem('reviewCards', JSON.stringify(newCards));
    return { reviewCards: newCards };
  }),
  setReviewCompleted: (deckId, completed) => set((state) => {
    const today = new Date().toISOString().split('T')[0];
    const newState = {
      ...state.reviewCompletionState,
      [deckId]: { completed, date: today }
    };
    localStorage.setItem('reviewCompletionState', JSON.stringify(newState));
    return { reviewCompletionState: newState };
  }),
  isReviewCompletedToday: (deckId) => {
    const state = useStore.getState();
    const completion = state.reviewCompletionState[deckId];
    if (!completion || !completion.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return completion.date === today;
  }
}));
