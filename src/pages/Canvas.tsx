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
import { Search, X, Save } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Custom Node Component
function TextNode({ data, selected }: any) {
  const [isEditing, setIsEditing] = useState(data.autoEdit || false);
  const [text, setText] = useState(data.label);

  return (
    <div
      className={`px-4 py-3 bg-bg-primary rounded-lg shadow-lg border-2 transition-all ${
        selected ? 'border-accent scale-105' : 'border-border-subtle hover:scale-[1.02]'
      }`}
      style={{ minWidth: 200, maxWidth: 300 }}
      onDoubleClick={() => setIsEditing(true)}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />
      {isEditing ? (
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            data.onChange?.(text);
          }}
          className="w-full bg-transparent outline-none resize-none text-sm"
          rows={3}
        />
      ) : (
        <div className="text-sm whitespace-pre-wrap">{text}</div>
      )}
    </div>
  );
}

// Knowledge Node Component
function KnowledgeNode({ data, selected }: any) {
  return (
    <div
      className={`w-72 bg-bg-primary rounded-xl shadow-xl border-2 transition-all overflow-hidden ${
        selected ? 'border-accent scale-105' : 'border-border-subtle hover:scale-[1.02]'
      }`}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <Handle type="source" position={Position.Right} className="w-3 h-3" />

      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-secondary/30">
        <div className="w-6 h-6" />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-serif tracking-tight mb-3 line-clamp-2">{data.title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
          {data.summary}
        </p>
      </div>
    </div>
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveSummary, setSaveSummary] = useState('');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [panOnDrag, setPanOnDrag] = useState(true);

  // Load existing canvas data
  useEffect(() => {
    if (id) {
      const item = knowledgeList.find(k => k.id === id);
      if (item?.canvasData) {
        setNodes(item.canvasData.nodes || []);
        setEdges(item.canvasData.edges || []);
        setSaveTitle(item.title);
        setSaveSummary(item.summary);
      }
    }
  }, [id, knowledgeList, setNodes, setEdges]);

  // Auto-save canvas
  useEffect(() => {
    if (!id || nodes.length === 0) return;
    const timer = setTimeout(() => {
      const existing = knowledgeList.find(k => k.id === id);
      if (existing) {
        updateKnowledge(id, {
          canvasData: { nodes, edges },
          updatedAt: new Date().toISOString(),
        });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [nodes, edges, id, knowledgeList, updateKnowledge]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', animated: true }, eds)),
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
      id: `knowledge-${item.id}`,
      type: 'knowledgeNode',
      position,
      data: {
        title: item.title,
        summary: item.summary,
        knowledgeId: item.id,
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

  const handleSave = () => {
    if (!saveTitle.trim()) {
      toast.error(language === 'zh' ? '请输入标题' : 'Please enter title');
      return;
    }

    const canvasItem = {
      id: id || Date.now().toString(),
      title: saveTitle,
      content: '',
      summary: saveSummary,
      tags: ['canvas'],
      createdAt: new Date().toISOString(),
      relatedIds: [],
      type: 'canvas' as const,
      canvasData: {
        nodes: nodes,
        edges: edges,
      },
    };

    const existing = knowledgeList.find(k => k.id === id);
    if (existing) {
      updateKnowledge(id!, canvasItem);
      toast.success(language === 'zh' ? '保存成功' : 'Saved');
    } else {
      addKnowledge(canvasItem);
      toast.success(language === 'zh' ? '保存成功' : 'Saved');
      navigate(`/note/canvas/${canvasItem.id}`);
    }
    setShowSaveModal(false);
  };

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
        className="bg-bg-secondary"
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'var(--theme-text-secondary)', strokeWidth: 2, opacity: 0.6 },
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
        <Background gap={20} size={1} color="var(--theme-border-subtle)" />
        <Controls />
        <MiniMap
          nodeColor={(node) => (node.type === 'knowledgeNode' ? 'var(--theme-accent)' : '#fff')}
          className="bg-bg-primary border border-border-subtle"
        />
        <Panel position="top-right" className="m-4 flex gap-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {language === 'zh' ? '保存' : 'Save'}
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-4 py-2 bg-text-primary text-bg-primary rounded-lg hover:bg-text-secondary transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {language === 'zh' ? '插入知识' : 'Insert Knowledge'}
          </button>
        </Panel>
        <Panel position="top-left" className="m-4 text-xs text-text-secondary bg-bg-primary/80 px-3 py-2 rounded-lg">
          {language === 'zh' ? '双击创建 · 拖动连线 · Shift多选 · 空格平移' : 'Double-click to create · Drag to connect · Shift to multi-select · Space to pan'}
        </Panel>
      </ReactFlow>

      {showSearch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowSearch(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-bg-primary rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border-subtle flex items-center gap-3">
              <Search className="w-5 h-5 text-text-secondary" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'zh' ? '搜索知识...' : 'Search knowledge...'}
                className="flex-1 bg-transparent outline-none"
              />
              <button onClick={() => setShowSearch(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-2">
              {filteredKnowledge.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addKnowledgeNode(item)}
                  className="w-full text-left p-3 rounded-lg hover:bg-bg-secondary transition-colors"
                >
                  <div className="font-medium mb-1">{item.title}</div>
                  <div className="text-sm text-text-secondary line-clamp-2">{item.summary}</div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {showSaveModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={() => setShowSaveModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-bg-primary rounded-xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif mb-4">
              {language === 'zh' ? '保存画布' : 'Save Canvas'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">
                  {language === 'zh' ? '标题' : 'Title'}
                </label>
                <input
                  autoFocus
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-transparent outline-none focus:border-accent"
                  placeholder={language === 'zh' ? '输入标题...' : 'Enter title...'}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">
                  {language === 'zh' ? '描述' : 'Description'}
                </label>
                <textarea
                  value={saveSummary}
                  onChange={(e) => setSaveSummary(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg bg-transparent outline-none focus:border-accent resize-none"
                  rows={3}
                  placeholder={language === 'zh' ? '输入描述...' : 'Enter description...'}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 rounded-lg hover:bg-bg-secondary transition-colors"
                >
                  {language === 'zh' ? '取消' : 'Cancel'}
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-colors"
                >
                  {language === 'zh' ? '保存' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
