import { useState, useRef, useEffect, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import {
  Folder, FolderOpen, File, ChevronRight, ChevronDown,
  MoreHorizontal, Trash2, Edit2, FolderPlus
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from './Navbar';
import { FolderItem } from '../types';

interface FolderSidebarProps {
  onSelectFolder: (folderId: string | null) => void;
  activeFolderId: string | null;
}

export function FolderSidebar({ onSelectFolder, activeFolderId }: FolderSidebarProps) {
  const { folders, knowledgeList, addFolder, updateFolder, deleteFolder, language, moveKnowledgeToFolder } = useStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('expandedFolders');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showNewFolder, setShowNewFolder] = useState<string | null>(null); // parentId or 'root'
  const [newFolderName, setNewFolderName] = useState('');
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('expandedFolders', JSON.stringify([...expandedFolders]));
  }, [expandedFolders]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (contextMenu && contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }

    function handleContextMenu(e: MouseEvent) {
      if (contextMenu && contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    }

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [contextMenu]);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const toggleExpand = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const getChildFolders = (parentId: string | null): FolderItem[] => {
    return folders.filter(f => f.parentId === parentId);
  };

  const getItemsInFolder = (folderId: string | null) => {
    return knowledgeList.filter(k => (k.folderId || null) === folderId);
  };

  const handleCreateFolder = (parentId: string | null) => {
    if (!newFolderName.trim()) return;

    const newFolder: FolderItem = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      parentId,
      isFolder: true,
      children: [],
      createdAt: new Date().toISOString()
    };

    addFolder(newFolder);
    setNewFolderName('');
    setShowNewFolder(null);

    if (parentId) {
      setExpandedFolders(prev => new Set([...prev, parentId]));
    }
  };

  const handleRename = (id: string) => {
    if (!renameValue.trim()) return;
    updateFolder(id, { name: renameValue.trim() });
    setRenamingId(null);
  };

  const handleDeleteFolder = (id: string) => {
    // Move items in this folder to root
    knowledgeList
      .filter(k => k.folderId === id)
      .forEach(k => moveKnowledgeToFolder(k.id, null));

    // Delete child folders recursively
    const deleteRecursive = (folderId: string) => {
      const children = folders.filter(f => f.parentId === folderId);
      children.forEach(child => {
        knowledgeList
          .filter(k => k.folderId === child.id)
          .forEach(k => moveKnowledgeToFolder(k.id, null));
        deleteRecursive(child.id);
        deleteFolder(child.id);
      });
    };

    deleteRecursive(id);
    deleteFolder(id);
    setContextMenu(null);

    if (activeFolderId === id) {
      onSelectFolder(null);
    }
  };

  // Drag and drop handlers for folders
  const handleFolderDragStart = (e: DragEvent, folderId: string) => {
    e.dataTransfer.setData('folder-id', folderId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFolderDragOver = (e: DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedFolderId = e.dataTransfer.types.includes('folder-id');
    const draggedKnowledgeId = e.dataTransfer.types.includes('knowledge-id');

    if (draggedFolderId || draggedKnowledgeId) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverFolderId(targetFolderId);
    }
  };

  const handleFolderDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragOverFolderId(null);
  };

  const handleFolderDrop = (e: DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    const draggedFolderId = e.dataTransfer.getData('folder-id');
    const draggedKnowledgeId = e.dataTransfer.getData('knowledge-id');

    if (draggedFolderId && draggedFolderId !== targetFolderId) {
      // Prevent dropping folder into itself or its children
      const isDescendant = (parentId: string, childId: string): boolean => {
        const children = folders.filter(f => f.parentId === parentId);
        for (const child of children) {
          if (child.id === childId || isDescendant(child.id, childId)) {
            return true;
          }
        }
        return false;
      };

      if (targetFolderId && isDescendant(draggedFolderId, targetFolderId)) {
        return; // Can't drop parent into child
      }

      updateFolder(draggedFolderId, { parentId: targetFolderId });

      if (targetFolderId) {
        setExpandedFolders(prev => new Set([...prev, targetFolderId]));
      }
    } else if (draggedKnowledgeId) {
      moveKnowledgeToFolder(draggedKnowledgeId, targetFolderId);
      if (targetFolderId) {
        setExpandedFolders(prev => new Set([...prev, targetFolderId]));
      }
    }
  };

  // Render folder tree item
  const renderFolder = (folder: FolderItem, depth: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const childFolders = getChildFolders(folder.id);
    const folderItems = getItemsInFolder(folder.id);
    const itemCount = folderItems.length;
    const isActive = activeFolderId === folder.id;
    const isRenaming = renamingId === folder.id;
    const isDragOver = dragOverFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div
          draggable={!isRenaming}
          onDragStart={(e) => handleFolderDragStart(e, folder.id)}
          onDragOver={(e) => handleFolderDragOver(e, folder.id)}
          onDragLeave={handleFolderDragLeave}
          onDrop={(e) => handleFolderDrop(e, folder.id)}
          className={cn(
            "group flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer transition-all text-sm",
            isActive ? "bg-accent/10 text-accent" : "hover:bg-bg-secondary",
            isDragOver && "ring-2 ring-accent bg-accent/5"
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            onSelectFolder(folder.id);
            if (childFolders.length > 0) {
              toggleExpand(folder.id);
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const newMenu = { id: folder.id, x: e.clientX, y: e.clientY };
            setContextMenu(newMenu);
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(folder.id);
            }}
            className="p-0.5 opacity-60 hover:opacity-100"
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </button>
          {isExpanded ? (
            <FolderOpen className="w-4 h-4 text-accent shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-text-secondary shrink-0" />
          )}

          {isRenaming ? (
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(folder.id);
                if (e.key === 'Escape') setRenamingId(null);
              }}
              onBlur={() => handleRename(folder.id)}
              className="flex-1 px-1 py-0 text-xs bg-bg-secondary border border-border-subtle rounded focus:outline-none focus:border-accent"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="flex-1 truncate text-sm font-serif">{folder.name}</span>
          )}

          {itemCount > 0 && !isRenaming && (
            <span className="text-xs text-text-secondary opacity-60 font-serif">{itemCount}</span>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu({ id: folder.id, x: e.clientX, y: e.clientY });
            }}
            className="p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>
        </div>

        {/* New subfolder input */}
        {showNewFolder === folder.id && (
          <div className="flex items-center gap-2 py-1 px-2" style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}>
            <FolderPlus className="w-3 h-3 text-accent shrink-0" />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder(folder.id);
                if (e.key === 'Escape') setShowNewFolder(null);
              }}
              onBlur={() => handleCreateFolder(folder.id)}
              placeholder={language === 'zh' ? '文件夹名称' : 'Folder name'}
              className="flex-1 px-2 py-1 text-xs bg-bg-secondary border border-border-subtle rounded focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>
        )}

        {/* Children */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              {childFolders.map(child => renderFolder(child, depth + 1))}
              {folderItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-bg-secondary transition-colors text-sm"
                  style={{ paddingLeft: `${(depth + 1) * 12 + 8}px` }}
                  onClick={() => window.location.href = `/note/${item.id}`}
                >
                  <File className="w-4 h-4 text-text-secondary shrink-0" />
                  <span className="flex-1 truncate text-sm font-serif">{item.title}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const rootFolders = getChildFolders(null);
  const uncategorizedCount = getItemsInFolder(null).length;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border-subtle/50 flex items-center justify-between shrink-0">
        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider font-serif">
          {language === 'zh' ? '文件管理' : 'Files'}
        </span>
        <button
          onClick={() => {
            setShowNewFolder('root');
            setNewFolderName('');
          }}
          className="p-1 hover:bg-bg-secondary rounded-md transition-colors"
          title={language === 'zh' ? '新建文件夹' : 'New Folder'}
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Folder tree */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {/* All Files */}
        <button
          onClick={() => onSelectFolder(null)}
          onDragOver={(e) => handleFolderDragOver(e, null)}
          onDragLeave={handleFolderDragLeave}
          onDrop={(e) => handleFolderDrop(e, null)}
          className={cn(
            "w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-all mb-1",
            activeFolderId === null ? "bg-accent/10 text-accent" : "hover:bg-bg-secondary"
          )}
        >
          <File className="w-4 h-4" />
          <span className="text-sm font-serif">{language === 'zh' ? '全部文件' : 'All Files'}</span>
          <span className="text-xs text-text-secondary ml-auto opacity-60 font-serif">{knowledgeList.length}</span>
        </button>

        {/* New root folder input */}
        {showNewFolder === 'root' && (
          <div className="flex items-center gap-2 py-1 px-2 mb-1">
            <FolderPlus className="w-3 h-3 text-accent shrink-0" />
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateFolder(null);
                if (e.key === 'Escape') setShowNewFolder(null);
              }}
              onBlur={() => handleCreateFolder(null)}
              placeholder={language === 'zh' ? '文件夹名称' : 'Folder name'}
              className="flex-1 px-2 py-1 text-xs bg-bg-secondary border border-border-subtle rounded focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>
        )}

        {/* Folder tree - root folders */}
        {rootFolders.map(folder => renderFolder(folder))}

        {/* Uncategorized - always show */}
        {uncategorizedCount > 0 && (
          <button
            onClick={() => onSelectFolder('uncategorized')}
            className={cn(
              "w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-sm transition-colors",
              rootFolders.length > 0 && "mt-2 border-t border-border-subtle/30 pt-3",
              activeFolderId === 'uncategorized' ? "bg-accent/10 text-accent" : "hover:bg-bg-secondary"
            )}
          >
            <File className="w-4 h-4 opacity-50" />
            <span className="text-sm text-text-secondary font-serif">{language === 'zh' ? '未分类' : 'Uncategorized'}</span>
            <span className="text-xs text-text-secondary ml-auto opacity-60 font-serif">{uncategorizedCount}</span>
          </button>
        )}
      </div>

      {/* Context Menu - using Portal to render outside */}
      {contextMenu && createPortal(
        <div
          ref={contextMenuRef}
          className="fixed bg-bg-primary border border-border-subtle rounded-lg shadow-xl py-1 z-[9999] min-w-[160px]"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
        >
          <button
              onClick={() => {
                setShowNewFolder(contextMenu.id);
                setNewFolderName('');
                setExpandedFolders(prev => new Set([...prev, contextMenu.id]));
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-secondary transition-colors font-serif"
            >
              <FolderPlus className="w-4 h-4" />
              {language === 'zh' ? '新建子文件夹' : 'New Subfolder'}
            </button>
            <button
              onClick={() => {
                const folder = folders.find(f => f.id === contextMenu.id);
                if (folder) {
                  setRenamingId(contextMenu.id);
                  setRenameValue(folder.name);
                }
                setContextMenu(null);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-secondary transition-colors font-serif"
            >
              <Edit2 className="w-4 h-4" />
              {language === 'zh' ? '重命名' : 'Rename'}
            </button>
            <div className="my-1 border-t border-border-subtle" />
            <button
              onClick={() => handleDeleteFolder(contextMenu.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors font-serif"
            >
              <Trash2 className="w-4 h-4" />
              {language === 'zh' ? '删除' : 'Delete'}
            </button>
        </div>,
        document.body
      )}
    </div>
  );
}
