import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCheck, FaLock } from 'react-icons/fa';
import { selectReduxSlice, setAltarProgress } from '../store/store';

const isEligible = (node, byId) =>
  node.unlocked || node.requires.length === 0 || node.requires.some((id) => byId[id]?.unlocked);

const Node = ({ node, byId, dispatch, reduxStateRef, accent }) => {
  const eligible = isEligible(node, byId);
  const requiresNames = node.requires.map((id) => byId[id]?.name).join(' or ');

  return (
    <button
      onClick={() => dispatch(setAltarProgress({ val: node, currentState: reduxStateRef.current }))}
      disabled={!eligible}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        textAlign: 'left',
        padding: '12px 14px',
        marginBottom: 8,
        borderRadius: 'var(--r-md)',
        border: '1px solid',
        borderColor: node.unlocked ? `rgba(${accent},0.3)` : 'var(--border-subtle)',
        backgroundColor: node.unlocked ? `rgba(${accent},0.07)` : 'var(--bg-surface)',
        cursor: eligible ? 'pointer' : 'default',
        opacity: eligible ? 1 : 0.45,
        gap: 6,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
          border: '1px solid',
          borderColor: node.unlocked ? `rgb(${accent})` : 'var(--border-subtle)',
          backgroundColor: node.unlocked ? `rgb(${accent})` : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {node.unlocked
            ? <FaCheck size={9} style={{ color: 'white' }} />
            : !eligible && <FaLock size={8} style={{ color: 'var(--text-muted)' }} />}
        </div>
        <span style={{
          fontSize: 10, fontWeight: '700', color: 'var(--text-muted)',
          width: 22, flexShrink: 0,
        }}>
          {node.label}
        </span>
        <span style={{
          flex: 1, fontSize: 14, fontWeight: '600',
          color: node.unlocked ? 'var(--text-dim)' : 'var(--text)',
        }}>
          {node.name}
        </span>
        <span style={{ fontSize: 12, color: 'var(--gold-bright)', flexShrink: 0 }}>
          {node.description}
        </span>
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', paddingLeft: 28, lineHeight: 1.5 }}>
        {eligible ? node.cost.join(', ') : `Requires: ${requiresNames}`}
      </span>
    </button>
  );
};

const AlterOfRites = () => {
  const dispatch      = useDispatch();
  const reduxState    = useSelector(selectReduxSlice);
  const reduxStateRef = useRef(reduxState);
  reduxStateRef.current = reduxState;

  const { altarProgress } = reduxState;
  const byId = Object.fromEntries(altarProgress.map((n) => [n.id, n]));

  const seals      = altarProgress.filter((n) => n.type === 'seal');
  const potions    = altarProgress.filter((n) => n.type === 'potion');
  const final      = altarProgress.find((n) => n.type === 'final');
  const unlockedCount = altarProgress.filter((n) => n.unlocked).length;
  const allButFinalUnlocked = altarProgress.filter((n) => n.type !== 'final').every((n) => n.unlocked);
  const pct = Math.round((unlockedCount / altarProgress.length) * 100);

  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-base)', padding: '24px 16px 48px' }}>

      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: '700', color: 'var(--text)', letterSpacing: '0.04em' }}>
          Altar of Rites
        </h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          Each Seal needs at least one connected Seal unlocked first — tap any eligible node to mark it claimed.
        </p>
      </div>

      {/* Overall progress */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
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

      {/* Seals */}
      <h3 style={{ fontSize: 11, fontWeight: '700', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
        Seals
      </h3>
      {seals.map((node) => (
        <Node key={node.id} node={node} byId={byId} dispatch={dispatch} reduxStateRef={reduxStateRef} accent="196,18,48" />
      ))}

      {/* Potion Powers */}
      <h3 style={{ fontSize: 11, fontWeight: '700', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '12px 0 8px' }}>
        Legendary Potion Powers
      </h3>
      {potions.map((node) => (
        <Node key={node.id} node={node} byId={byId} dispatch={dispatch} reduxStateRef={reduxStateRef} accent="224,168,48" />
      ))}

      {/* Final reward */}
      <h3 style={{ fontSize: 11, fontWeight: '700', color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '12px 0 8px' }}>
        Full Completion
      </h3>
      <div style={{
        padding: '12px 14px',
        borderRadius: 'var(--r-md)',
        border: '1px solid',
        borderColor: allButFinalUnlocked ? 'rgba(255,0,255,0.3)' : 'var(--border-subtle)',
        backgroundColor: allButFinalUnlocked ? 'rgba(255,0,255,0.06)' : 'var(--bg-surface)',
        opacity: allButFinalUnlocked ? 1 : 0.45,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ flex: 1, fontSize: 14, fontWeight: '600', color: 'var(--text)' }}>{final.name}</span>
          <span style={{ fontSize: 12, color: 'var(--gold-bright)' }}>{final.description}</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {allButFinalUnlocked ? 'All Seals and Potion Powers unlocked — this is yours for free.' : 'Unlocks automatically once every Seal and Potion Power above is unlocked.'}
        </span>
      </div>

    </div>
  );
};

export default AlterOfRites;
