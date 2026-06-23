import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectReduxSlice, setAltarProgress, setAltarCascade } from '../store/store';
import { altarSealCostSequence } from '../data/altarOfRitesData';

const ACCENT = { seal: '196,18,48', potion: '224,168,48', final: '255,0,255' };
// Sized in container-query units (cqw = % of the tree panel's own width) so dots,
// tap targets, and labels scale up together as the panel grows, with clamps so
// nothing gets too small to read or too large to look sane at 750px wide.
const DOT_SIZE   = 'clamp(12px, 3.2cqw, 22px)';
const HIT_SIZE   = 'clamp(26px, 5cqw, 38px)';
const LABEL_SIZE = 'clamp(10px, 2.2cqw, 15px)';
const LABEL_WIDTH = 'clamp(54px, 11cqw, 84px)';

const isEligible = (node, byId) =>
  node.unlocked || node.requires.length === 0 || node.requires.some((id) => byId[id]?.unlocked);

// If `startId` gets locked, find every other currently-unlocked node that's only
// standing because of it (directly or transitively) and would become invalid too.
// Seals/Potions use OR logic on `requires` (locked only if NONE of their listed
// prerequisites remain unlocked). The final bonus is the one exception — it
// requires EVERY other node, so losing any single one takes it down. Repeats
// passes over the whole set until a pass makes no further changes, since locking
// one node can strand another, which can strand another, and so on.
const computeCascadeLocks = (startId, progress) => {
  const byId = Object.fromEntries(progress.map((n) => [n.id, n]));
  const locked = new Set([startId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of progress) {
      if (!node.unlocked || locked.has(node.id)) continue;
      const stillSupported = node.type === 'final'
        ? progress.filter((n) => n.type !== 'final').every((n) => n.unlocked && !locked.has(n.id))
        : node.requires.length === 0 || node.requires.some((rid) => byId[rid]?.unlocked && !locked.has(rid));
      if (!stillSupported) {
        locked.add(node.id);
        changed = true;
      }
    }
  }
  locked.delete(startId);
  return Array.from(locked);
};

// Bounding box of the node layout, with padding. Shared by the SVG line layer's
// viewBox and the HTML dot layer's percentage positions so both line up exactly,
// regardless of how small the overall panel is rendered.
const getBounds = (nodes) => {
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const pad = 40;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const w = Math.max(...xs) - Math.min(...xs) + pad * 2;
  const h = Math.max(...ys) - Math.min(...ys) + pad * 2;
  return { minX, minY, w, h };
};

const AlterOfRites = () => {
  const dispatch       = useDispatch();
  const reduxState     = useSelector(selectReduxSlice);
  const reduxStateRef  = useRef(reduxState);
  const [hoveredId, setHoveredId] = useState(null);
  const [cascadeWarning, setCascadeWarning] = useState(null); // { nodeId, affectedIds } | null
  reduxStateRef.current = reduxState;

  const { altarProgress } = reduxState;
  const byId = Object.fromEntries(altarProgress.map((n) => [n.id, n]));
  const bounds = getBounds(altarProgress);

  const unlockedCount = altarProgress.filter((n) => n.unlocked).length;
  const pct = Math.round((unlockedCount / altarProgress.length) * 100);
  // How far along the seal cost ladder we are — based on how many Seals are
  // unlocked, not which ones, since the cost is the same regardless of choice.
  const unlockedSealCount = altarProgress.filter((n) => n.type === 'seal' && n.unlocked).length;

  const toggle = (node) => {
    dispatch(setAltarProgress({ val: node, currentState: reduxStateRef.current }));
  };

  // Locking a node can strand others that were only unlocked through it. If that
  // would happen, hold off and let the user confirm instead of silently wiping
  // out progress; unlocking (and locking something with no dependents) is safe
  // and happens immediately.
  const handleNodeClick = (node) => {
    if (node.unlocked) {
      const affectedIds = computeCascadeLocks(node.id, altarProgress);
      if (affectedIds.length > 0) {
        setCascadeWarning({ nodeId: node.id, affectedIds });
        return;
      }
    }
    toggle(node);
  };

  const confirmCascade = () => {
    dispatch(setAltarCascade([cascadeWarning.nodeId, ...cascadeWarning.affectedIds], reduxStateRef.current));
    setCascadeWarning(null);
  };

  // Same breakpoint the app already uses to switch from BottomNav to Sidebar.
  const isWide = reduxState.width >= 768;

  const costLadder = (
    <div style={{ flexShrink: 0, width: isWide ? 300 : '100%', padding: isWide ? '12px 0 24px 16px' : '4px 16px 24px' }}>
      <h3 style={{ fontSize: 13, fontWeight: '700', color: 'var(--text)', letterSpacing: '0.04em' }}>
        Seal Unlock Cost Ladder
      </h3>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, marginBottom: 12 }}>
        Same cost no matter which eligible Seal you pick — this is your {unlockedSealCount < 26 ? `${unlockedSealCount + 1}` : 'final'} Seal unlock.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {altarSealCostSequence.map((cost, i) => {
          const spent = i < unlockedSealCount;
          const current = i === unlockedSealCount;
          return (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'baseline', gap: 10,
                padding: '6px 10px',
                borderRadius: 'var(--r-sm)',
                backgroundColor: current ? 'rgba(196,18,48,0.12)' : 'transparent',
                border: current ? '1px solid var(--border)' : '1px solid transparent',
                opacity: spent ? 0.45 : 1,
              }}
            >
              <span style={{
                fontSize: 11, fontWeight: '700', width: 22, flexShrink: 0,
                color: current ? 'var(--red-bright)' : 'var(--text-muted)',
              }}>
                {i + 1}
              </span>
              <span style={{
                fontSize: 12,
                color: spent ? 'var(--text-muted)' : current ? 'var(--text)' : 'var(--text-dim)',
                textDecoration: spent ? 'line-through' : 'none',
              }}>
                {cost.join(', ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-base)', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Header */}
      <div style={{ flexShrink: 0, padding: '20px 16px 0' }}>
        <h2 style={{ fontSize: 18, fontWeight: '700', color: 'var(--text)', letterSpacing: '0.04em' }}>
          Altar of Rites
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          Tap a node to unlock or undo it. Hover for the full effect and cost.
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

        {/* Small-screen-only: the full ladder is below a scroll on mobile, so surface
            the next cost here too — on wide screens the ladder already sits beside
            the tree, so this would just be redundant. */}
        {!isWide && (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 10 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              Next Seal cost:
            </span>
            <span style={{ fontSize: 12, fontWeight: '700', color: 'var(--red-bright)' }}>
              {unlockedSealCount < 26 ? altarSealCostSequence[unlockedSealCount].join(', ') : 'All Seals unlocked'}
            </span>
          </div>
        )}
      </div>

      {/* On wide screens the cost ladder sits to the left of the tree so both are
          visible at once; on narrow screens the ladder drops below the tree. */}
      <div style={{ flex: 1, display: 'flex', flexDirection: isWide ? 'row' : 'column' }}>
        {isWide && costLadder}

        {/* Tree — tap a node to toggle it, hover for the full effect. */}
        <div style={{ flex: 1, minWidth: 0, padding: '12px 8px 24px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 750,
          aspectRatio: `${bounds.w} / ${bounds.h}`,
          containerType: 'inline-size',
        }}>

          {/* Edges */}
          <svg
            viewBox={`${bounds.minX} ${bounds.minY} ${bounds.w} ${bounds.h}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            {altarProgress.map((node) =>
              node.requires.map((reqId) => {
                const from = byId[reqId];
                const active = from?.unlocked;
                return (
                  <line
                    key={`${reqId}-${node.id}`}
                    x1={from.x} y1={from.y} x2={node.x} y2={node.y}
                    stroke={active ? 'var(--red-bright)' : 'rgba(196,18,48,0.45)'}
                    strokeWidth={active ? 3 : 2}
                    opacity={active ? 0.95 : 0.85}
                  />
                );
              })
            )}
          </svg>

          {/* Nodes — real HTML so labels stay legible no matter how small the panel is */}
          {altarProgress.map((node) => {
            const eligible = isEligible(node, byId);
            const accent = ACCENT[node.type];
            const leftPct = ((node.x - bounds.minX) / bounds.w) * 100;
            const topPct  = ((node.y - bounds.minY) / bounds.h) * 100;
            const above   = node.labelOffset === 'above';
            const hovered = hoveredId === node.id;

            return (
              // The button's box is centered exactly on the coordinate point — the
              // dot sits centered inside it, so the dot's center always matches the
              // line endpoint. The label is an absolutely-positioned child anchored
              // to the button's edge, so it can't pull the dot off-point.
              <button
                key={node.id}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`, top: `${topPct}%`,
                  width: HIT_SIZE, height: HIT_SIZE,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', padding: 0,
                  cursor: 'pointer', opacity: eligible ? 1 : 0.85,
                  zIndex: hovered ? 5 : 1,
                }}
              >
                <div style={{
                  width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: node.unlocked
                    ? `rgb(${accent})`
                    : eligible
                      ? `rgba(${accent},0.22)`
                      : 'rgba(255,255,255,0.07)',
                  border: `2.5px solid ${node.unlocked || eligible ? `rgb(${accent})` : 'rgba(255,255,255,0.35)'}`,
                }} />
                <span style={{
                  position: 'absolute',
                  left: '50%', transform: 'translateX(-50%)',
                  ...(above ? { bottom: 'calc(100% + 2px)' } : { top: 'calc(100% + 2px)' }),
                  fontSize: LABEL_SIZE, fontWeight: '600', lineHeight: 1.3, textAlign: 'center',
                  width: hovered ? 200 : LABEL_WIDTH,
                  color: node.unlocked || eligible ? 'var(--text)' : 'var(--text-dim)',
                  pointerEvents: 'none',
                  whiteSpace: hovered ? 'pre-line' : 'normal',
                  ...(hovered
                    ? {
                        backgroundColor: '#161618',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-sm)',
                        padding: '8px 10px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                      }
                    : { textShadow: '0 0 4px var(--bg-base), 0 0 4px var(--bg-base)' }),
                }}>
                  {hovered
                    ? node.type === 'seal'
                      ? node.effect
                      : `${node.effect}\n\nCost: ${node.cost.join(', ')}`
                    : node.description}
                </span>
              </button>
            );
          })}
        </div>
        </div>

        {!isWide && costLadder}
      </div>

      {/* Cascade warning — shown instead of acting immediately whenever locking a
          node would strand others that depended on it. */}
      {cascadeWarning && (
        <div
          onClick={() => setCascadeWarning(null)}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 380,
              backgroundColor: '#161618',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              padding: '20px 20px 16px',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: '700', color: 'var(--text)' }}>
              This will also lock {cascadeWarning.affectedIds.length} other node{cascadeWarning.affectedIds.length === 1 ? '' : 's'}
            </span>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              These were only unlocked through the node you're locking, directly or further down the chain — none of them have another open path left:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cascadeWarning.affectedIds.map((id) => (
                <span key={id} style={{
                  fontSize: 12, fontWeight: '600', color: 'var(--text-dim)',
                  backgroundColor: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-sm)', padding: '3px 8px',
                }}>
                  {byId[id]?.name}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => setCascadeWarning(null)}
                style={{
                  flex: 1, height: 42,
                  backgroundColor: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-md)', color: 'var(--text-dim)',
                  fontSize: 13, fontWeight: '700', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmCascade}
                style={{
                  flex: 1, height: 42,
                  background: 'linear-gradient(to right, var(--red), #8b0000)',
                  border: '1px solid var(--red-dim)',
                  borderRadius: 'var(--r-md)', color: 'white',
                  fontSize: 13, fontWeight: '700', cursor: 'pointer',
                }}
              >
                Lock Them All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlterOfRites;
