# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Neuron is a personal knowledge management system (second brain) built with React 19, TypeScript, and Vite. It features a block-based editor, knowledge graph visualization, spaced repetition review system, and AI integration.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 3000
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Type check with TypeScript
npm run clean        # Remove dist folder
```

## Architecture

### State Management (Zustand)

All global state is managed in `src/store/useStore.ts` using Zustand. Key state includes:

- **Knowledge data**: `knowledgeList`, `folders`, `reviewDecks`, `reviewCards`
- **UI state**: `sidebarCollapsed`, `navbarWidth`, `folderSidebarWidth`, `agentSidebarWidth`, `isAgentOpen`, `isAgentSidebar`
- **User preferences**: `language`, `theme`, `smoothCursor`
- **Filters**: `searchQuery`, `selectedTags`, `knowledgeTypeFilter`, `sortBy`, `activeFolderId`

All sidebar widths and UI preferences persist to localStorage automatically via the store actions.

### Routing Structure

Routes are defined in `src/App.tsx`:

- `/` - Landing page (LandingNew)
- `/login` - Login page
- `/dashboard` - Main knowledge base view with folder sidebar
- `/note/:id` - Knowledge detail view with TipTap editor
- `/note/canvas/:id` - Canvas view for visual knowledge mapping
- `/timeline` - Chronological view of knowledge items
- `/graph` - Network graph visualization (D3/XYFlow)
- `/review` - Spaced repetition review system
- `/agent` - AI assistant page
- `/profile` - User profile and settings

All authenticated routes use the `<Layout />` wrapper which includes `<Navbar />`, `<TopBar />`, and `<AgentChat />`.

### Key Components

**Layout Components:**
- `Navbar.tsx` - Left sidebar navigation with resizable width (64-280px), auto-collapse at 80px
- `TopBar.tsx` - Top header bar that adjusts position based on navbar width
- `Layout.tsx` - Main layout wrapper with navbar, topbar, and content area
- `AgentChat.tsx` - AI assistant with floating/sidebar modes, resizable (280-600px)

**Sidebar Components:**
- `FolderSidebar.tsx` - Folder management sidebar on Dashboard, resizable (180-400px)
- `PinnedCardsSidebar.tsx` - Right sidebar for pinned knowledge cards

**Editor Components:**
- `BlockEditor.tsx` - TipTap-based rich text editor with bubble menu
- `RichEditor.tsx` - Alternative editor component
- `FloatingToolbar.tsx` - Formatting toolbar for editors

**Data Components:**
- `KnowledgeCard.tsx` - Card display for knowledge items with drag-and-drop support
- `SearchBar.tsx` - Search input with real-time filtering
- `TagFilter.tsx` - Tag selection and filtering
- `TypeFilter.tsx` - Filter by knowledge type (note/concept/canvas)
- `SortFilter.tsx` - Sort options (recent/oldest/title)

### Resizable Sidebars

Three sidebars support drag-to-resize with localStorage persistence:

1. **Main Navbar** (`navbarWidth`): 64-280px, auto-collapses at ≤80px, auto-expands at >80px
2. **Folder Sidebar** (`folderSidebarWidth`): 180-400px
3. **Agent Sidebar** (`agentSidebarWidth`): 280-600px

All resize handlers prevent text selection during drag with `document.body.style.userSelect = 'none'`.

### Internationalization

Bilingual support (English/Chinese) via `src/i18n/index.ts`. Use the `useTranslation()` hook:

```typescript
const { t, language } = useTranslation();
// t('dashboard') returns 'Knowledge' or '知识库'
```

Default language is Chinese (`zh`). Language preference persists to localStorage.

### Theme System

Three theme modes: `light`, `dark`, `system`. Managed via `useTheme()` hook in `src/hooks/useTheme.ts`. Theme preference persists to localStorage.

### Data Types

Core types in `src/types/index.ts`:

- `KnowledgeItem` - Main knowledge entity with title, content, tags, relations, versions, folder assignment, and type (note/concept/canvas)
- `FolderItem` - Hierarchical folder structure with parent/child relationships
- `ReviewCard` - Spaced repetition card with SM-2 algorithm fields
- `ReviewDeck` - Collection of review cards
- `ChatMessage` - AI chat message with role and content

### Drag and Drop

Uses `@dnd-kit` for drag-and-drop functionality:
- Knowledge cards can be dragged between folders
- Folder items can be reordered
- Canvas nodes support drag positioning

### Animation

Uses Framer Motion (`motion`) for:
- Page transitions with `AnimatePresence`
- Sidebar expand/collapse animations
- Card entrance animations
- Modal and dropdown animations

GSAP with ScrollTrigger for scroll-based animations on Dashboard card grid.

## Important Patterns

### Responsive Design

- Navbar auto-hides folder sidebar on screens <1280px
- TopBar adjusts left position and width based on navbar state
- Grid layouts use Tailwind breakpoints: `lg:grid-cols-2 2xl:grid-cols-3`
- Font sizes scale with breakpoints: `text-2xl md:text-3xl lg:text-5xl`

### Tooltip Support

Collapsed navbar icons show tooltips via `title` attribute when `collapsed` prop is true.

### Width Synchronization

When navbar is collapsed, use `sidebarCollapsed ? 64 : navbarWidth` to calculate actual width for positioning other elements.

## Styling

- Tailwind CSS 4 with custom design tokens
- CSS variables for theme colors (defined in theme system)
- Utility-first approach with `cn()` helper (clsx + tailwind-merge)
- Custom cursor component (`CustomCursor.tsx`) for enhanced UX

## Mock Data

Development uses mock data from `src/mock/data.ts`. In production, this would connect to a backend API.
