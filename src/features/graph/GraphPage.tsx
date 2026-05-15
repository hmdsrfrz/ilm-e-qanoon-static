import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { fetchStaticJson } from '@/services/staticApi';

const ENTITY_COLORS: Record<string, string> = {
  person:       '#009942',
  organization: '#3B82F6',
  location:     '#F59E0B',
  event:        '#EC4899',
  law:          '#8B5CF6',
  legislation:  '#8B5CF6',
  concept:      '#6B7280',
  court:        '#14B8A6',
};

function entityColor(type: string): string {
  return ENTITY_COLORS[(type ?? '').toLowerCase()] ?? '#9A8D80';
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  name: string;
  type: string;
  description: string;
  degree: number;
}

interface GraphEdge {
  source: string;
  target: string;
  description: string;
  weight: number;
}

interface GraphData {
  bucket_id: string;
  node_count: number;
  edge_count: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface SharedEntity {
  entity: string;
  display: string;
  buckets: string[];
  count: number;
}

interface CrossDomainData {
  buckets: string[];
  shared_entity_count: number;
  shared_entities: SharedEntity[];
  overlap_matrix: Record<string, Record<string, number>>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function bucketLabel(id: string): string {
  return id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function scoreNode(node: GraphNode, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const name = node.name.toLowerCase();
  const desc = (node.description ?? '').toLowerCase();
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;
  if (name.includes(q)) return 60;
  if (desc.includes(q)) return 30;
  return 0;
}

// ── Explorer Tab ─────────────────────────────────────────────────────────────

function ExplorerTab({ availableBuckets }: { availableBuckets: string[] }) {
  const [bucket, setBucket] = useState<string>('');
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Initialize to zero — graph is hidden until the container is measured
  const [dims, setDims] = useState({ w: 0, h: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const obsRef = useRef<ResizeObserver | null>(null);

  // Callback ref — fires exactly when the div mounts, regardless of loading state.
  // useLayoutEffect with [] misses the element when an early return precedes it.
  const containerRef = useCallback((el: HTMLDivElement | null) => {
    if (obsRef.current) { obsRef.current.disconnect(); obsRef.current = null; }
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    setDims({ w: width, h: height });
    const obs = new ResizeObserver(([entry]) => {
      setDims({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    obs.observe(el);
    obsRef.current = obs;
  }, []);

  // Set initial bucket once — do NOT reset every time availableBuckets changes
  useEffect(() => {
    if (availableBuckets.length > 0 && bucket === '') {
      setBucket(availableBuckets[0]);
    }
  }, [availableBuckets, bucket]);

  // Fetch graph — abort in-flight request when bucket changes
  useEffect(() => {
    if (!bucket) return;
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    setSelected(null);
    setSearchQuery('');
    fetchStaticJson<GraphData>(`graph/${bucket}.json`)
      .then(setData)
      .catch((e: Error) => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, [bucket]);

  // Stable graphData for ForceGraph — spread so simulation mutates its own copies
  const graphData = useMemo(() => {
    if (!data) return { nodes: [], links: [] };
    return {
      nodes: data.nodes.map((n) => ({ ...n })),
      links: data.edges.map((e) => ({ ...e })),
    };
  }, [data]);

  // Search results from current graph data
  const searchResults = useMemo<GraphNode[]>(() => {
    if (!searchQuery.trim() || !data) return [];
    return data.nodes
      .map((n) => ({ node: n, score: scoreNode(n, searchQuery.trim()) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ node }) => node);
  }, [data, searchQuery]);

  // Neighbors of the selected node
  const connectedNodes = useMemo<GraphNode[]>(() => {
    if (!selected || !data) return [];
    const neighborIds = new Set<string>();
    data.edges.forEach((e) => {
      // source/target are plain string IDs in data.edges
      if (e.source === selected.id) neighborIds.add(e.target);
      if (e.target === selected.id) neighborIds.add(e.source);
    });
    return data.nodes
      .filter((n) => neighborIds.has(n.id))
      .sort((a, b) => b.degree - a.degree);
  }, [selected, data]);

  // Focus the camera on a node using force-graph's live position data
  const focusNode = useCallback((node: GraphNode) => {
    setSelected(node);
    setSearchQuery('');
    if (!fgRef.current) return;
    // fgRef.current.graphData() returns the internal graph with simulation x/y
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const live = (fgRef.current.graphData().nodes as any[]).find((n) => n.id === node.id);
    if (live?.x !== undefined) {
      fgRef.current.centerAt(live.x, live.y, 600);
      fgRef.current.zoom(5, 600);
    }
  }, []);

  const handleNodeClick = useCallback((raw: unknown) => {
    const node = raw as GraphNode;
    setSelected(node);
    setSearchQuery('');
  }, []);

  if (!bucket && availableBuckets.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span className="font-mono animate-pulse" style={{ fontSize: '10px', color: '#9A8D80', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Loading available graphs…
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
        <span className="font-mono" style={{ fontSize: '10px', color: '#9A8D80', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Bucket</span>
        <select
          value={bucket}
          onChange={(e) => setBucket(e.target.value)}
          style={{
            background: '#0a0a0a', color: '#F5F0E8',
            border: '1px solid #2a2a2a', padding: '4px 8px',
            fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px', cursor: 'pointer',
          }}
        >
          {availableBuckets.map((b) => <option key={b} value={b}>{bucketLabel(b)}</option>)}
        </select>
        {data && (
          <span className="font-mono" style={{ fontSize: '10px', color: '#9A8D80' }}>
            {data.node_count} nodes · {data.edge_count} edges
          </span>
        )}
      </div>

      {/* Graph + Right panel */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, gap: '12px' }}>

        {/* Canvas container — fills ALL remaining space */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            border: '1px solid #2a2a2a',
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#060606',
          }}
        >
          {loading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="font-mono animate-pulse" style={{ fontSize: '10px', color: '#9A8D80', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
                Loading Graph…
              </span>
            </div>
          )}
          {error && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
              <span className="font-mono" style={{ fontSize: '11px', color: '#EC4899', textAlign: 'center' }}>{error}</span>
            </div>
          )}
          {/* Only render after dims are measured (w > 0) to avoid wrong-sized first render */}
          {!loading && !error && data && dims.w > 0 && (
            <ForceGraph2D
              ref={fgRef}
              width={dims.w}
              height={dims.h}
              graphData={graphData}
              nodeLabel="name"
              nodeVal={(node) => Math.max(2, (node as GraphNode).degree)}
              linkColor={() => 'rgba(120, 160, 120, 0.45)'}
              linkWidth={(link) => Math.max(0.8, (link as GraphEdge).weight * 0.6)}
              backgroundColor="#060606"
              onNodeClick={handleNodeClick}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const n = node as GraphNode & { x: number; y: number };
                const r = Math.max(3, Math.sqrt(n.degree + 1) * 2.2);
                const isSelected = selected?.id === n.id;
                const isNeighbor = connectedNodes.some((c) => c.id === n.id);

                if (isSelected) {
                  ctx.beginPath();
                  ctx.arc(n.x, n.y, r + 5, 0, 2 * Math.PI);
                  ctx.fillStyle = 'rgba(245,240,232,0.1)';
                  ctx.fill();
                } else if (isNeighbor) {
                  ctx.beginPath();
                  ctx.arc(n.x, n.y, r + 3, 0, 2 * Math.PI);
                  ctx.fillStyle = 'rgba(0,153,66,0.12)';
                  ctx.fill();
                }

                ctx.beginPath();
                ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
                ctx.fillStyle = isSelected
                  ? '#F5F0E8'
                  : isNeighbor
                    ? entityColor(n.type)
                    : entityColor(n.type);
                ctx.globalAlpha = isSelected || isNeighbor || !selected ? 1 : 0.3;
                ctx.fill();
                ctx.globalAlpha = 1;

                if (isSelected || isNeighbor) {
                  ctx.strokeStyle = isSelected ? '#F5F0E8' : '#009942';
                  ctx.lineWidth = (isSelected ? 1.5 : 1) / globalScale;
                  ctx.stroke();
                }

                if (globalScale >= 1.2) {
                  const label = n.name.length > 22 ? n.name.slice(0, 20) + '…' : n.name;
                  const fontSize = Math.max(8, 10 / globalScale);
                  ctx.font = `${fontSize}px IBM Plex Mono, monospace`;
                  ctx.fillStyle = isSelected ? '#F5F0E8' : isNeighbor ? 'rgba(245,240,232,0.9)' : 'rgba(245,240,232,0.45)';
                  ctx.textAlign = 'center';
                  ctx.fillText(label, n.x, n.y + r + fontSize + 1);
                }
              }}
            />
          )}
        </div>

        {/* Right panel */}
        <div style={{ width: '250px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>

          {/* Entity search */}
          <div style={{ border: '1px solid #2a2a2a', padding: '12px', flexShrink: 0 }}>
            <p className="font-mono" style={{ fontSize: '9px', color: '#9A8D80', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Entity Search
            </p>
            <input
              type="text"
              placeholder="Search entities…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!data}
              style={{
                width: '100%', background: '#0a0a0a', border: '1px solid #2a2a2a',
                color: '#F5F0E8', padding: '6px 8px',
                fontFamily: 'IBM Plex Mono, monospace', fontSize: '11px',
                outline: 'none', boxSizing: 'border-box',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#009942')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
            />
            {searchResults.length > 0 && (
              <div style={{ marginTop: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                {searchResults.map((node) => (
                  <div
                    key={node.id}
                    onClick={() => focusNode(node)}
                    style={{
                      padding: '6px 8px', cursor: 'pointer',
                      borderBottom: '1px solid rgba(42,42,42,0.5)',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,153,66,0.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: entityColor(node.type), flexShrink: 0 }} />
                    <span className="font-mono" style={{ fontSize: '10px', color: '#F5F0E8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {node.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.trim() && searchResults.length === 0 && data && (
              <p className="font-mono" style={{ fontSize: '10px', color: '#9A8D80', marginTop: '8px' }}>No match</p>
            )}
          </div>

          {/* Node detail + connected nodes */}
          <div style={{ border: '1px solid #2a2a2a', flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px' }}>
            {selected ? (
              <>
                <p className="font-mono" style={{ fontSize: '9px', color: '#9A8D80', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '8px' }}>Selected</p>
                <p className="font-mono" style={{ fontSize: '12px', color: '#F5F0E8', marginBottom: '6px', wordBreak: 'break-word' }}>
                  {selected.name}
                </p>
                <div style={{ display: 'inline-block', padding: '2px 6px', border: `1px solid ${entityColor(selected.type)}`, marginBottom: '10px' }}>
                  <span className="font-mono" style={{ fontSize: '9px', color: entityColor(selected.type), letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    {selected.type || 'unknown'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                  <div>
                    <p className="font-mono" style={{ fontSize: '9px', color: '#9A8D80', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Connections</p>
                    <p className="font-mono" style={{ fontSize: '20px', color: '#009942' }}>{selected.degree}</p>
                  </div>
                </div>

                {selected.description && (
                  <>
                    <p className="font-mono" style={{ fontSize: '9px', color: '#9A8D80', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>Description</p>
                    <p className="font-mono" style={{ fontSize: '10px', color: 'rgba(245,240,232,0.7)', lineHeight: 1.6, wordBreak: 'break-word', marginBottom: '14px' }}>
                      {selected.description.length > 280
                        ? selected.description.slice(0, 280) + '…'
                        : selected.description}
                    </p>
                  </>
                )}

                {/* Connected nodes */}
                {connectedNodes.length > 0 && (
                  <>
                    <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '12px', marginTop: '4px' }}>
                      <p className="font-mono" style={{ fontSize: '9px', color: '#9A8D80', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Connected · {connectedNodes.length}
                      </p>
                      {connectedNodes.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => focusNode(n)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '7px',
                            padding: '5px 6px', cursor: 'pointer',
                            borderBottom: '1px solid rgba(42,42,42,0.4)',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,153,66,0.06)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: entityColor(n.type), flexShrink: 0 }} />
                          <span className="font-mono" style={{ fontSize: '10px', color: 'rgba(245,240,232,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                            {n.name}
                          </span>
                          <span className="font-mono" style={{ fontSize: '9px', color: '#9A8D80', flexShrink: 0 }}>{n.degree}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="font-mono" style={{ fontSize: '10px', color: '#9A8D80', lineHeight: 1.6 }}>
                Click a node or search for an entity to inspect it.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', flexShrink: 0 }}>
        {Object.entries(ENTITY_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
            <span className="font-mono" style={{ fontSize: '9px', color: '#9A8D80', textTransform: 'uppercase', letterSpacing: '0.15em' }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Cross-Domain Tab ──────────────────────────────────────────────────────────

function CrossDomainTab() {
  const [data, setData] = useState<CrossDomainData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    fetchStaticJson<CrossDomainData>('graph/cross-domain.json')
      .then(setData)
      .catch((e: Error) => { if (e.name !== 'AbortError') setError(e.message); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <span className="font-mono animate-pulse" style={{ fontSize: '10px', color: '#9A8D80', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Analysing Cross-Domain Links…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p className="font-mono" style={{ fontSize: '11px', color: '#EC4899', marginBottom: '8px' }}>Failed to load cross-domain data</p>
        <p className="font-mono" style={{ fontSize: '10px', color: '#9A8D80' }}>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { buckets, shared_entities, overlap_matrix } = data;

  if (buckets.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
        <p className="font-mono" style={{ fontSize: '11px', color: '#9A8D80' }}>No indexed graphs found.</p>
      </div>
    );
  }

  const allValues = buckets.flatMap((b1) => buckets.map((b2) => overlap_matrix[b1]?.[b2] ?? 0));
  const maxVal = Math.max(1, ...allValues);

  return (
    <div style={{ height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', gap: '24px', flexShrink: 0 }}>
        <Stat label="Buckets Indexed" value={buckets.length} />
        <Stat label="Shared Entities" value={data.shared_entity_count} />
      </div>

      <section style={{ flexShrink: 0 }}>
        <SectionHeader>Bucket Overlap Heatmap</SectionHeader>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono, monospace' }}>
            <thead>
              <tr>
                <th style={{ width: '130px' }} />
                {buckets.map((b) => (
                  <th key={b} style={{ padding: '6px 10px', fontSize: '9px', color: '#9A8D80', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 'normal', whiteSpace: 'nowrap' }}>
                    {bucketLabel(b)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buckets.map((b1) => (
                <tr key={b1}>
                  <td style={{ padding: '4px 10px 4px 0', fontSize: '9px', color: '#9A8D80', letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {bucketLabel(b1)}
                  </td>
                  {buckets.map((b2) => {
                    const val = b1 === b2 ? '—' : (overlap_matrix[b1]?.[b2] ?? 0);
                    const intensity = b1 === b2 ? 0 : Math.round(((overlap_matrix[b1]?.[b2] ?? 0) / maxVal) * 180);
                    return (
                      <td
                        key={b2}
                        title={b1 !== b2 ? `${bucketLabel(b1)} ∩ ${bucketLabel(b2)}: ${val} shared` : undefined}
                        style={{
                          padding: '4px 10px', textAlign: 'center', fontSize: '11px',
                          color: b1 === b2 ? '#2a2a2a' : '#F5F0E8',
                          backgroundColor: b1 === b2 ? 'transparent' : `rgba(0,153,66,${intensity / 255})`,
                          border: '1px solid #1a1a1a', minWidth: '60px',
                        }}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ flex: 1, minHeight: 0 }}>
        <SectionHeader>Shared Entities ({data.shared_entity_count})</SectionHeader>
        <div style={{ overflowY: 'auto', maxHeight: '420px', border: '1px solid #2a2a2a' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'IBM Plex Mono, monospace' }}>
            <thead style={{ position: 'sticky', top: 0, backgroundColor: '#0a0a0a' }}>
              <tr>
                <th style={thStyle}>Entity</th>
                {buckets.map((b) => <th key={b} style={thStyle}>{bucketLabel(b)}</th>)}
                <th style={thStyle}>Count</th>
              </tr>
            </thead>
            <tbody>
              {shared_entities.map((ent) => (
                <tr key={ent.entity} style={{ borderBottom: '1px solid rgba(42,42,42,0.5)' }}>
                  <td style={tdStyle}>{ent.display}</td>
                  {buckets.map((b) => (
                    <td key={b} style={{ ...tdStyle, textAlign: 'center' }}>
                      {ent.buckets.includes(b) ? <span style={{ color: '#009942' }}>✓</span> : <span style={{ color: '#2a2a2a' }}>·</span>}
                    </td>
                  ))}
                  <td style={{ ...tdStyle, textAlign: 'center', color: '#009942' }}>{ent.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-mono" style={{ fontSize: '9px', color: '#9A8D80', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</p>
      <p className="font-mono" style={{ fontSize: '28px', color: '#009942', lineHeight: 1 }}>{value}</p>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono" style={{ fontSize: '9px', color: '#9A8D80', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '10px' }}>
      {children}
    </p>
  );
}

const thStyle: React.CSSProperties = {
  padding: '8px 12px', fontSize: '9px', color: '#9A8D80',
  letterSpacing: '0.2em', textTransform: 'uppercase',
  fontWeight: 'normal', textAlign: 'left', borderBottom: '1px solid #2a2a2a',
};

const tdStyle: React.CSSProperties = {
  padding: '8px 12px', fontSize: '11px', color: 'rgba(245,240,232,0.75)',
  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px',
};

// ── Page shell ────────────────────────────────────────────────────────────────

type Tab = 'explorer' | 'cross-domain';

export default function GraphPage() {
  const [tab, setTab] = useState<Tab>('explorer');
  const [availableBuckets, setAvailableBuckets] = useState<string[]>([]);

  useEffect(() => {
    fetchStaticJson<string[]>('buckets.json').then(setAvailableBuckets).catch(() => {});
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '20px 24px', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, marginBottom: '16px' }}>
        <p className="font-mono" style={{ fontSize: '9px', color: '#9A8D80', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Knowledge Graph
        </p>
        <h1 className="font-mono" style={{ fontSize: '18px', color: '#F5F0E8', marginBottom: '12px' }}>
          Graph Explorer
        </h1>
        <div style={{ display: 'flex', borderBottom: '1px solid #2a2a2a' }}>
          {(['explorer', 'cross-domain'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="font-mono"
              style={{
                padding: '6px 16px', fontSize: '10px', letterSpacing: '0.2em',
                textTransform: 'uppercase', cursor: 'pointer', background: 'transparent', border: 'none',
                borderBottom: tab === t ? '2px solid #009942' : '2px solid transparent',
                color: tab === t ? '#F5F0E8' : '#9A8D80',
                transition: 'color 0.15s, border-color 0.15s', marginBottom: '-1px',
              }}
            >
              {t === 'explorer' ? 'Explorer' : 'Cross-Domain'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {tab === 'explorer'
          ? <ExplorerTab availableBuckets={availableBuckets} />
          : <CrossDomainTab />}
      </div>
    </div>
  );
}
