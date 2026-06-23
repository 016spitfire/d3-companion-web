import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCheck, FaLock, FaTimes } from 'react-icons/fa';
import { selectReduxSlice, setAltarProgress } from '../store/store';

const ACCENT = { seal: '196,18,48', potion: '224,168,48', final: '255,0,255' };
const RADIUS = 23;

const isEligible = (node, byId) =>
  node.unlocked || node.requires.length === 0 || node.requires.some((id) => byId[id]?.unlocked);

// Bounding box of the node layout, with padding, used as the SVG viewBox.
const getViewBox = (nodes) => {
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const pad = RADIUS + 15;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const w = Math.max(...xs) - Math.min(...xs) + pad * 2;
  const h = Math.max(...ys) - Math.min(...ys) + pad * 2;
  return `${minX} ${minY} ${w} ${h}`;
};

const AlterOfRites = () => {
  const dispatch       = useDispatch();
  const reduxState     = useSelector(selectReduxSlice);
  const reduxStateRef  = useRef(reduxState);
  const [selectedId, setSelectedId] = useState(null);
  reduxStateRef.current = reduxState;

  const { altarProgress } = reduxState;
  const byId = Object.fromEntries(altarProgress.map((n) => [n.id, n]));
  const selected = selectedId !== null ? byId[selectedId] : null;

  const unlockedCount = altarProgress.filter((n) => n.unlocked).length;
  const pct = Math.round((unlockedCount / altarProgress.length) * 100);

  const toggle = (node) => {
    dispatch(setAltarProgress({ val: node, currentState: reduxStateRef.current }));
  };

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Header */}
      <div style={{ flexShrink: 0, padding: '20px 16px 0' }}>
        <h2 style={{ fontSize: 18, fontWeight: '700', color: 'var(--text)', letterSpacing: '0.04em' }}>
          Altar of Rites
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          Tap a node to view it. Lines turn green once a path into that node is open.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              {unlockedCount} / {altarProgress.length} unlocked
            </span>
            <span style={{ fontSize: 12, fontWeight: '700', color: 'var(--text-dim)' }}>{pct}%</span>
          </div>
          <div style={{ width: '100%', height: 6, backgroundColor: 'var(--bg-raised)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              width: `${pct}%`, height: '100%',
              background: 'linear-gradient(to right, var(--red), var(--red-bright))',
              borderRadius: 3, transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Tree */}
      <div style={{ flex: 1, padding: '12px 8px 24px' }}>
        <svg viewBox={getViewBox(altarProgress)} style={{ width: '100%', height: 'auto', display: 'block' }}>

          {/* Edges, drawn first so nodes sit on top */}
          {altarProgress.map((node) =>
            node.requires.map((reqId) => {
              const from = byId[reqId];
              const active = from?.unlocked;
              return (
                <line
                  key={`${reqId}-${node.id}`}
                  x1={from.x} y1={from.y} x2={node.x} y2={node.y}
                  stroke={active ? 'var(--red-bright)' : 'var(--border)'}
                  strokeWidth={active ? 2.5 : 1.5}
                  opacity={active ? 0.9 : 0.4}
                />
              );
            })
          )}

          {/* Nodes */}
          {altarProgress.map((node) => {
            const eligible = isEligible(node, byId);
            const accent = ACCENT[node.type];
            const fill = node.unlocked ? `rgb(${accent})` : 'var(--bg-surface)';
            const stroke = node.unlocked ? `rgb(${accent})` : eligible ? `rgb(${accent})` : 'var(--border-subtle)';

            return (
              <g key={node.id} onClick={() => setSelectedId(node.id)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={node.x} cy={node.y} r={RADIUS}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={eligible ? 2.5 : 1.5}
                  strokeDasharray={!node.unlocked && eligible ? '4 2' : 'none'}
                  opacity={eligible ? 1 : 0.45}
                />
                <text
                  x={node.x} y={node.y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize={node.label.length > 1 ? 11 : 13}
                  fontWeight="700"
                  fill={node.unlocked ? 'white' : eligible ? 'var(--text)' : 'var(--text-muted)'}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail panel */}
      {selected && (
        <div
          onClick={() => setSelectedId(null)}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 440,
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
              padding: '20px 20px 28px',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 11, fontWeight: '700', color: `rgb(${ACCENT[selected.type]})`,
                border: `1px solid rgba(${ACCENT[selected.type]},0.4)`,
                borderRadius: 'var(--r-sm)', padding: '2px 6px',
              }}>
                {selected.label}
              </span>
              <span style={{ flex: 1, fontSize: 17, fontWeight: '700', color: 'var(--text)' }}>
                {selected.name}
              </span>
              <button onClick={() => setSelectedId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <FaTimes size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {selected.effect}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Cost
              </span>
              <span style={{ fontSize: 13, color: 'var(--gold-bright)' }}>
                {selected.cost.join(', ')}
              </span>
            </div>

            {selected.requires.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Requires (any one)
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                  {selected.requires.map((id) => byId[id]?.name).join(' or ')}
                </span>
              </div>
            )}

            {selected.type !== 'final' && (
              <button
                onClick={() => { toggle(selected); if (selected.unlocked) setSelectedId(null); }}
                disabled={!isEligible(selected, byId)}
                style={{
                  marginTop: 8, height: 46,
                  background: selected.unlocked
                    ? 'var(--bg-raised)'
                    : isEligible(selected, byId)
                      ? `linear-gradient(to right, rgb(${ACCENT[selected.type]}), rgba(${ACCENT[selected.type]},0.7))`
                      : 'var(--bg-raised)',
                  border: '1px solid',
                  borderColor: isEligible(selected, byId) ? `rgb(${ACCENT[selected.type]})` : 'var(--border-subtle)',
                  borderRadius: 'var(--r-md)',
                  color: selected.unlocked ? 'var(--text-dim)' : isEligible(selected, byId) ? 'white' : 'var(--text-muted)',
                  fontSize: 13, fontWeight: '700', letterSpacing: '0.06em', textTransform: 'uppercase',
                  cursor: isEligible(selected, byId) ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {selected.unlocked
                  ? (<><FaCheck size={11} /> Unlocked — Tap to Undo</>)
                  : isEligible(selected, byId)
                    ? 'Unlock'
                    : (<><FaLock size={10} /> Locked</>)}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlterOfRites;
