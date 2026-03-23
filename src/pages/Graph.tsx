import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { X, Pin, PinOff } from 'lucide-react';
import { cn } from '../components/Navbar';
import { PinnedCardsSidebar } from '../components/PinnedCardsSidebar';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  tags: string[];
  summary: string;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

// Detail card component
function NodeDetailCard({
  node,
  isPinned,
  onClose,
  onPin,
  onView,
  t
}: {
  node: GraphNode;
  isPinned: boolean;
  onClose: () => void;
  onPin: () => void;
  onView: () => void;
  t: (key: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, x: 20 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="w-72 bg-bg-primary border border-border-subtle rounded-xl shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-secondary/30">
        <button
          onClick={onPin}
          className={cn(
            "p-1.5 rounded-md transition-all",
            isPinned
              ? "bg-text-primary text-bg-primary"
              : "hover:bg-border-subtle text-text-secondary hover:text-text-primary"
          )}
          title={isPinned ? t('unpin') : t('pin')}
        >
          {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
        </button>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-border-subtle text-text-secondary hover:text-text-primary transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-serif tracking-tight mb-3 line-clamp-2">{node.title}</h3>
        <p className="text-sm text-text-secondary mb-4 leading-relaxed line-clamp-3">
          {node.summary}
        </p>

        {node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {node.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-border-subtle rounded"
              >
                {tag}
              </span>
            ))}
            {node.tags.length > 3 && (
              <span className="text-[10px] text-text-secondary">+{node.tags.length - 3}</span>
            )}
          </div>
        )}

        <button
          onClick={onView}
          className="w-full py-2 bg-text-primary text-bg-primary text-xs uppercase tracking-widest font-medium rounded-md hover:bg-text-secondary transition-colors"
        >
          {t('viewDetail')}
        </button>
      </div>
    </motion.div>
  );
}

export default function Graph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { knowledgeList, pinnedCards, pinCard, unpinCard } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  // D3 Force Simulation
  useEffect(() => {
    if (isLoading || !svgRef.current || !containerRef.current || knowledgeList.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width || 800;
    const height = rect.height || 500;

    svg.attr('width', width).attr('height', height);

    const nodes: GraphNode[] = knowledgeList.map(item => ({
      id: item.id,
      title: item.title,
      tags: item.tags,
      summary: item.summary
    }));

    const links: GraphLink[] = [];
    knowledgeList.forEach(item => {
      if (item.relatedIds) {
        item.relatedIds.forEach(relatedId => {
          if (knowledgeList.some(k => k.id === relatedId)) {
            const exists = links.some(l =>
              ((typeof l.source === 'string' ? l.source : l.source.id) === item.id &&
               (typeof l.target === 'string' ? l.target : l.target.id) === relatedId) ||
              ((typeof l.source === 'string' ? l.source : l.source.id) === relatedId &&
               (typeof l.target === 'string' ? l.target : l.target.id) === item.id)
            );
            if (!exists) {
              links.push({ source: item.id, target: relatedId });
            }
          }
        });
      }
    });

    // Add random connections for visual effect
    if (links.length < nodes.length / 2 && nodes.length > 1) {
      for (let i = 0; i < Math.min(nodes.length, 10); i++) {
        const sourceIdx = Math.floor(Math.random() * nodes.length);
        const targetIdx = Math.floor(Math.random() * nodes.length);
        if (sourceIdx !== targetIdx) {
          const sourceId = nodes[sourceIdx].id;
          const targetId = nodes[targetIdx].id;
          const exists = links.some(l =>
            ((typeof l.source === 'string' ? l.source : l.source.id) === sourceId &&
             (typeof l.target === 'string' ? l.target : l.target.id) === targetId) ||
            ((typeof l.source === 'string' ? l.source : l.source.id) === targetId &&
             (typeof l.target === 'string' ? l.target : l.target.id) === sourceId)
          );
          if (!exists) {
            links.push({ source: sourceId, target: targetId });
          }
        }
      }
    }

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => container.attr('transform', event.transform));

    svg.call(zoom);

    const container = svg.append('g');

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))
      .alphaDecay(0.1)
      .velocityDecay(0.6);

    const link = container.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#555')
      .attr('stroke-opacity', 0.4)
      .attr('stroke-width', 1.5);

    const node = container.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer');

    node.append('circle')
      .attr('r', 10)
      .attr('fill', '#f5f5f5')
      .attr('stroke', '#333')
      .attr('stroke-width', 2)
      .on('mouseover', function() {
        d3.select(this).transition().duration(200)
          .attr('r', 14).attr('fill', '#333').attr('stroke', '#f5f5f5');
      })
      .on('mouseout', function() {
        d3.select(this).transition().duration(200)
          .attr('r', 10).attr('fill', '#f5f5f5').attr('stroke', '#333');
      });

    node.append('text')
      .text(d => d.title.length > 15 ? d.title.substring(0, 15) + '...' : d.title)
      .attr('x', 16).attr('y', 4)
      .attr('font-size', '12px').attr('font-family', 'Inter, sans-serif').attr('fill', '#888');

    node.on('click', (_event, d) => setSelectedNode(d));

    const drag = d3.drag<SVGGElement, GraphNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.05).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(drag);

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [knowledgeList, isLoading]);

  const handleViewDetail = useCallback((node: GraphNode) => {
    navigate(`/note/${node.id}`);
  }, [navigate]);

  const handlePin = useCallback((node: GraphNode) => {
    const isPinned = pinnedCards.some(n => n.id === node.id);
    if (isPinned) {
      unpinCard(node.id);
    } else {
      pinCard({ id: node.id, title: node.title, summary: node.summary });
    }
  }, [pinnedCards, pinCard, unpinCard]);

  const isNodePinned = (nodeId: string) => pinnedCards.some(n => n.id === nodeId);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden">
      {/* Main graph area */}
      <div className="flex-1 flex flex-col p-6">
        <header className="mb-4">
          <h1 className="text-4xl md:text-5xl font-serif tracking-tighter mb-2">{t('networkTitle')}</h1>
          <p className="text-text-secondary text-sm font-light max-w-md">
            {t('networkDesc')}
          </p>
        </header>

        <div
          ref={containerRef}
          className="flex-grow w-full border border-border-subtle rounded-xl overflow-hidden bg-bg-primary relative"
        >
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-border-subtle border-t-text-primary rounded-full animate-spin" />
            </div>
          ) : knowledgeList.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-text-secondary font-serif text-xl">
              {t('noResults')}
            </div>
          ) : (
            <>
              <svg ref={svgRef} className="w-full h-full" style={{ display: 'block' }} />

              {/* Stats */}
              <div className="absolute bottom-4 left-4 text-[10px] uppercase tracking-widest font-mono text-text-secondary bg-bg-primary/80 px-2 py-1 rounded backdrop-blur-sm border border-border-subtle">
                {knowledgeList.length} {t('nodes')} / {knowledgeList.reduce((acc, item) => acc + (item.relatedIds?.length || 0), 0)} {t('connections')}
              </div>

              {/* Help text */}
              <div className="absolute top-4 left-4 text-[10px] text-text-secondary font-mono bg-bg-primary/80 px-2 py-1 rounded backdrop-blur-sm border border-border-subtle">
                {t('graphHelp')}
              </div>
            </>
          )}

          {/* Selected node detail card */}
          <div className="absolute top-4 right-4 z-[70]">
            <AnimatePresence>
              {selectedNode && (
                <NodeDetailCard
                  node={selectedNode}
                  isPinned={isNodePinned(selectedNode.id)}
                  onClose={() => setSelectedNode(null)}
                  onPin={() => handlePin(selectedNode)}
                  onView={() => handleViewDetail(selectedNode)}
                  t={t}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <PinnedCardsSidebar />
    </div>
  );
}
