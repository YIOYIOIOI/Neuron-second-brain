import { useCallback, useState, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  NodeTypes,
  Panel,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowLeft, Copy, Trash2, Lock, Unlock } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { useParams, useNavigate } from 'react-router-dom';
import { PinnedCardsSidebar } from '../components/PinnedCardsSidebar';

// Custom Node Component
function TextNode({ data, selected }: any) {
  const [isEditing, setIsEditing] = useState(data.autoEdit || false);
  const [text, setText] = useState(data.label);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`px-5 py-4 rounded-2xl shadow-lg border-2 transition-all backdrop-blur-md ${
        selected ? 'border-accent shadow-2xl' : 'border-transparent hover:shadow-xl'
      }`}
      style={{
        minWidth: 200,
        maxWidth: 300,
        background: 'rgba(255, 255, 255, 0.85)',
        boxShadow: selected ? '0 20px 40px rgba(0,0,0,0.12)' : '0 10px 30px rgba(0,0,0,0.05)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
      onDoubleClick={() => setIsEditing(true)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-400 !border-2 !border-white" style={{ opacity: isHovered ? 1 : 0 }} />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-400 !border-2 !border-white" style={{ opacity: isHovered ? 1 : 0 }} />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-400 !border-2 !border-white" style={{ opacity: isHovered ? 1 : 0 }} />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-gray-400 !border-2 !border-white" style={{ opacity: isHovered ? 1 : 0 }} />
      {isEditing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            data.onChange?.(text);
          }}
          className="w-full bg-transparent outline-none resize-none text-gray-800"
          style={{ fontSize: '14px', lineHeight: '1.6' }}
          rows={3}
        />
      ) : (
        <div className="text-gray-800 whitespace-pre-wrap" style={{ fontSize: '14px', lineHeight: '1.6' }}>{text}</div>
      )}
    </motion.div>
  );
}

// Knowledge Node Component
function KnowledgeNode({ data, selected }: any) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [title, setTitle] = useState(data.title);
  const [summary, setSummary] = useState(data.summary);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`w-72 rounded-2xl shadow-lg border-2 transition-all overflow-hidden backdrop-blur-md ${
        selected ? 'border-accent shadow-2xl' : 'border-transparent hover:shadow-xl'
      }`}
      style={{
        background: 'rgba(255, 255, 255, 0.85)',
        boxShadow: selected ? '0 20px 40px rgba(0,0,0,0.12)' : '0 10px 30px rgba(0,0,0,0.05)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-gray-400 !border-2 !border-white" style={{ opacity: isHovered ? 1 : 0 }} />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-gray-400 !border-2 !border-white" style={{ opacity: isHovered ? 1 : 0 }} />
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-gray-400 !border-2 !border-white" style={{ opacity: isHovered ? 1 : 0 }} />
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-gray-400 !border-2 !border-white" style={{ opacity: isHovered ? 1 : 0 }} />

      <div className="p-5 pb-3" onDoubleClick={() => setIsEditingTitle(true)}>
        {isEditingTitle ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              setIsEditingTitle(false);
              data.onTitleChange?.(title);
            }}
            className="w-full bg-transparent outline-none text-base font-semibold text-gray-800"
            style={{ lineHeight: '1.5' }}
          />
        ) : (
          <h3 className="text-base font-semibold tracking-tight line-clamp-2 text-gray-800" style={{ lineHeight: '1.5' }}>{title}</h3>
        )}
      </div>

      <div className="border-t border-gray-200/50" />

      <div className="p-5 pt-3" onDoubleClick={() => setIsEditingSummary(true)}>
        {isEditingSummary ? (
          <textarea
            autoFocus
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            onBlur={() => {
              setIsEditingSummary(false);
              data.onSummaryChange?.(summary);
            }}
            className="w-full bg-transparent outline-none resize-none text-sm text-gray-500"
            style={{ lineHeight: '1.6' }}
            rows={3}
          />
        ) : (
          <p className="text-sm leading-relaxed line-clamp-3 text-gray-500" style={{ lineHeight: '1.6' }}>
            {summary}
          </p>
        )}
      </div>
    </motion.div>
  );
}

const nodeTypes: NodeTypes = {
  textNode: TextNode,
  knowledgeNode: KnowledgeNode,
};

export default function Canvas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { knowledgeList, addKnowledge, updateKnowledge } = useStore();
  const { language } = useTranslation();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [panOnDrag, setPanOnDrag] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId?: string } | null>(null);

  // Load existing canvas data
  useEffect(() => {
    if (id) {
      const item = knowledgeList.find(k => k.id === id);
      if (item?.canvasData) {
        setNodes(item.canvasData.nodes || []);
        setEdges(item.canvasData.edges || []);
      }
    }
  }, [id, knowledgeList, setNodes, setEdges]);

  // Auto-save canvas
  useEffect(() => {
    if (!id) return;
    const timer = setTimeout(() => {
      const existing = knowledgeList.find(k => k.id === id);
      if (existing) {
        updateKnowledge(id, {
          canvasData: { nodes, edges },
          updatedAt: new Date().toISOString(),
        });
      } else if (nodes.length > 0 || edges.length > 0) {
        addKnowledge({
          id,
          title: language === 'zh' ? '无标题画布' : 'Untitled Canvas',
          content: '',
          summary: language === 'zh' ? '画布' : 'Canvas',
          tags: ['canvas'],
          createdAt: new Date().toISOString(),
          relatedIds: [],
          type: 'canvas',
          canvasData: { nodes, edges },
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [nodes, edges, id, knowledgeList, updateKnowledge, addKnowledge, language]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: false,
      style: {
        stroke: 'rgba(0,0,0,0.15)',
        strokeWidth: 2,
        strokeDasharray: '5,5'
      }
    }, eds)),
    [setEdges]
  );

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (event.detail === 2 && reactFlowInstance) {
        const bounds = reactFlowWrapper.current?.getBoundingClientRect();
        if (!bounds) return;

        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        });

        const newNode: Node = {
          id: `node-${Date.now()}`,
          type: 'textNode',
          position,
          data: {
            label: language === 'zh' ? '双击编辑' : 'Double click to edit',
            autoEdit: true,
            onChange: (newText: string) => {
              setNodes((nds) =>
                nds.map((node) =>
                  node.id === newNode.id
                    ? { ...node, data: { ...node.data, label: newText, autoEdit: false } }
                    : node
                )
              );
            },
          },
        };

        setNodes((nds) => [...nds, newNode]);
      }
    },
    [reactFlowInstance, setNodes, language]
  );

  const addKnowledgeNode = (item: any) => {
    if (!reactFlowInstance) return;

    const position = reactFlowInstance.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });

    const newNode: Node = {
      id: `knowledge-${item.id}-${Date.now()}`,
      type: 'knowledgeNode',
      position,
      data: {
        title: item.title,
        summary: item.summary,
        knowledgeId: item.id,
        onTitleChange: (newTitle: string) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === newNode.id
                ? { ...node, data: { ...node.data, title: newTitle } }
                : node
            )
          );
        },
        onSummaryChange: (newSummary: string) => {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === newNode.id
                ? { ...node, data: { ...node.data, summary: newSummary } }
                : node
            )
          );
        },
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setShowSearch(false);
    setSearchQuery('');
  };

  const filteredKnowledge = knowledgeList.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
  }, []);

  const onPaneContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const handleDeleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setContextMenu(null);
  };

  const handleDuplicateNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      const newNode = {
        ...node,
        id: `${node.type}-${Date.now()}`,
        position: { x: node.position.x + 50, y: node.position.y + 50 },
      };
      setNodes((nds) => [...nds, newNode]);
    }
    setContextMenu(null);
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="w-full h-screen" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onPaneClick={onPaneClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        nodeTypes={nodeTypes}
        minZoom={0.5}
        maxZoom={2}
        fitView
        panOnDrag={panOnDrag}
        selectionOnDrag
        panOnScroll={false}
        selectionMode="partial"
        multiSelectionKeyCode="Shift"
        deleteKeyCode="Delete"
        style={{ background: '#f7f7f5' }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
          style: {
            stroke: 'rgba(0,0,0,0.15)',
            strokeWidth: 2,
            strokeDasharray: '5,5'
          },
        }}
        onKeyDown={(e) => {
          if (e.code === 'Space') {
            setPanOnDrag(false);
          }
        }}
        onKeyUp={(e) => {
          if (e.code === 'Space') {
            setPanOnDrag(true);
          }
        }}
      >
        <Background
          gap={20}
          size={1.5}
          color="rgba(0,0,0,0.4)"
        />
        <Controls className="!bg-white/80 !backdrop-blur-md !border-gray-200 !shadow-lg !rounded-xl" position="bottom-left" />
        <MiniMap
          nodeColor={(node) => (node.type === 'knowledgeNode' ? '#3182CE' : '#718096')}
          className="!bg-white/80 !backdrop-blur-md !border-gray-200 !shadow-lg !rounded-xl"
          maskColor="rgba(0,0,0,0.05)"
          position="top-left"
          style={{ left: 20, top: 80 }}
        />
        <Panel position="top-right" className="m-4 flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-white/80 backdrop-blur-md text-gray-800 rounded-xl hover:bg-white transition-all shadow-lg border border-gray-200 flex items-center gap-2"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px' }}
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'zh' ? '返回' : 'Back'}
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-4 py-2 bg-accent text-white rounded-xl hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
            style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '14px' }}
          >
            <Search className="w-4 h-4" />
            {language === 'zh' ? '插入知识' : 'Insert Knowledge'}
          </button>
        </Panel>
        <Panel position="top-left" className="m-4 text-xs bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-gray-200" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#888' }}>
          {language === 'zh' ? '双击创建 · 拖动连线 · Shift多选 · 空格平移' : 'Double-click to create · Drag to connect · Shift to multi-select · Space to pan'}
        </Panel>
      </ReactFlow>

      {showSearch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => setShowSearch(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-200/50"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            <div className="p-5 border-b border-gray-200/50 flex items-center gap-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'zh' ? '搜索知识...' : 'Search knowledge...'}
                className="flex-1 bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
                style={{ fontSize: '15px' }}
              />
              <button onClick={() => setShowSearch(false)} className="hover:bg-gray-100 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-3 space-y-1.5">
              {filteredKnowledge.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => addKnowledgeNode(item)}
                  className="w-full text-left p-4 rounded-xl hover:bg-gray-100/60 transition-all"
                >
                  <div className="font-semibold mb-1.5 text-gray-800" style={{ fontSize: '14px' }}>{item.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-2" style={{ fontSize: '13px' }}>{item.summary}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bg-bg-primary border border-border-subtle rounded-lg shadow-xl overflow-hidden z-[70] min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.nodeId ? (
              <>
                <button
                  onClick={() => handleDuplicateNode(contextMenu.nodeId!)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-secondary transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {language === 'zh' ? '复制' : 'Duplicate'}
                </button>
                <button
                  onClick={() => handleDeleteNode(contextMenu.nodeId!)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {language === 'zh' ? '删除' : 'Delete'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setShowSearch(true); setContextMenu(null); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-secondary transition-colors"
                >
                  <Search className="w-4 h-4" />
                  {language === 'zh' ? '插入知识' : 'Insert Knowledge'}
                </button>
                <button
                  onClick={() => setContextMenu(null)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg-secondary transition-colors"
                >
                  <Lock className="w-4 h-4" />
                  {language === 'zh' ? '锁定画布' : 'Lock Canvas'}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PinnedCardsSidebar />
    </div>
  );
}
