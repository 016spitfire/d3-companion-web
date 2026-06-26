import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaChevronDown, FaChevronRight, FaFlask, FaSave, FaTrash, FaTimes } from 'react-icons/fa';
import { selectReduxSlice, setAltarProgress, setAltarCascade, setAltarPlan, setAltarSavedPlans } from '../store/store';
import { altarSealCostSequence, altarPotionCostSequence, altarMatHuntingRoute, altarDamagePushingRoute, altarBalancedRoute } from '../data/altarOfRitesData';
import { computeCascadeLocks } from '../utils/altarCascade';

const SUGGESTED_ROUTES = [
  { key: 'matHunting', label: 'Mat Hunting', route: altarMatHuntingRoute },
  { key: 'damagePushing', label: 'Damage & Pushing', route: altarDamagePushingRoute },
  { key: 'balanced', label: 'Balanced', route: altarBalancedRoute },
];

// Seals stay the app's red. Potions and the final bonus use Diablo's own
// item-rarity colors (Set green / Magic blue) — chosen specifically because
// they sit far from red on the hue wheel, so they stay clearly distinct from
// Seals (and the medium-red "ready" state) instead of blurring together.
// True Reaper of Souls steel blue is reserved for the planner feature later.
const ACCENT = { seal: '196,18,48', potion: '30,200,90', final: '70,120,230' };
// True Reaper of Souls steel blue, reserved specifically for the planner —
// a "planned" node is a different kind of state than any unlock-progress
// color above, so it gets a hue none of them use.
const PLAN_ACCENT = '70,130,180';
// Sized in container-query units (cqw = % of the tree panel's own width) so dots,
// tap targets, and labels scale up together as the panel grows, with clamps so
// nothing gets too small to read or too large to look sane at 750px wide.
const DOT_SIZE   = 'clamp(12px, 3.2cqw, 22px)';
const HIT_SIZE   = 'clamp(26px, 5cqw, 38px)';
const LABEL_SIZE = 'clamp(10px, 2.2cqw, 15px)';
const LABEL_WIDTH = 'clamp(54px, 11cqw, 84px)';

const isEligible = (node, byId) =>
  node.unlocked || node.requires.length === 0 || node.requires.some((id) => byId[id]?.unlocked);

// A node is plannable if at least one of its prerequisites is either already
// really unlocked, or already earlier in the plan — the plan is built by
// appending in click order, so "in the plan at all" already means "earlier."
const isPlanEligible = (node, plan, byId) =>
  plan.includes(node.id)
  || node.requires.length === 0
  || node.requires.some((rid) => byId[rid]?.unlocked || plan.includes(rid));

// Same reachability approach as computeCascadeLocks, applied to the plan: grow
// a confirmed-still-plannable set outward from real roots/real-unlocked nodes
// instead of shrinking from "everything," so the same mutual-reference cycle
// (Malice/Omen) can't prop itself up forever. The final bonus isn't plannable
// (it's automatic), so it never appears here.
const computeCascadePlanRemovals = (startId, plan, byId) => {
  const stillValid = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of plan) {
      if (id === startId || stillValid.has(id)) continue;
      const node = byId[id];
      const supported = node.requires.length === 0
        || node.requires.some((rid) => rid !== startId && (byId[rid]?.unlocked || (plan.includes(rid) && stillValid.has(rid))));
      if (supported) {
        stillValid.add(id);
        changed = true;
      }
    }
  }
  return plan.filter((id) => id !== startId && !stillValid.has(id));
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
  const [cascadeWarning, setCascadeWarning] = useState(null); // { mode: 'unlock'|'plan', nodeId, affectedIds } | null
  const [showSpentCosts, setShowSpentCosts] = useState(false);
  const [planningMode, setPlanningMode] = useState(false);
  const [routeToLoad, setRouteToLoad] = useState(null); // { key, label, route } | null
  const [savePlanPrompt, setSavePlanPrompt] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  reduxStateRef.current = reduxState;

  const { altarPlan, altarSavedPlans } = reduxState;
  // The final bonus isn't something you ever toggle yourself — in-game it just
  // happens once everything else is done. Its "unlocked" is fully derived here
  // rather than read from stored state, so there's no real toggle to click and
  // nothing that could ever desync from the other 29 nodes.
  const allOthersUnlocked = reduxState.altarProgress.filter((n) => n.type !== 'final').every((n) => n.unlocked);
  const altarProgress = reduxState.altarProgress.map((n) =>
    n.type === 'final' ? { ...n, unlocked: allOthersUnlocked } : n
  );
  const byId = Object.fromEntries(altarProgress.map((n) => [n.id, n]));
  const bounds = getBounds(altarProgress);

  const unlockedCount = altarProgress.filter((n) => n.unlocked).length;
  const pct = Math.round((unlockedCount / altarProgress.length) * 100);
  // How far along the seal cost ladder we are — based on how many Seals are
  // unlocked, not which ones, since the cost is the same regardless of choice.
  const unlockedSealCount = altarProgress.filter((n) => n.type === 'seal' && n.unlocked).length;
  const unlockedPotionCount = altarProgress.filter((n) => n.type === 'potion' && n.unlocked).length;
  // Seals and Potions run on two completely independent cost ladders, so they
  // each get their own "next" — there isn't one shared sequence to advance
  // through. Same idea as before: "next" is just the first entry of that type
  // that isn't really unlocked yet, so it advances on its own as you play.
  const nextSealId = altarPlan.filter((id) => byId[id]?.type === 'seal').find((id) => !byId[id]?.unlocked);
  const nextPotionId = altarPlan.filter((id) => byId[id]?.type === 'potion').find((id) => !byId[id]?.unlocked);

  const toggle = (node) => {
    dispatch(setAltarProgress({ val: node, currentState: reduxStateRef.current }));
  };

  // Locking a node can strand others that were only unlocked through it. If that
  // would happen, hold off and let the user confirm instead of silently wiping
  // out progress; unlocking (and locking something with no dependents) is safe
  // and happens immediately.
  const handleNodeClick = (node) => {
    if (node.type === 'final') return;
    if (node.unlocked) {
      const affectedIds = computeCascadeLocks(node.id, altarProgress);
      if (affectedIds.length > 0) {
        setCascadeWarning({ mode: 'unlock', nodeId: node.id, affectedIds });
        return;
      }
    }
    toggle(node);
  };

  // Planning mode is a separate, hypothetical layer on top of real progress.
  // The final bonus isn't a real choice (it's automatic), and something already
  // really unlocked has nothing left to plan, so both are no-ops here.
  const handlePlanClick = (node) => {
    if (node.type === 'final' || node.unlocked) return;
    if (altarPlan.includes(node.id)) {
      const affectedIds = computeCascadePlanRemovals(node.id, altarPlan, byId);
      if (affectedIds.length > 0) {
        setCascadeWarning({ mode: 'plan', nodeId: node.id, affectedIds });
        return;
      }
      dispatch(setAltarPlan(altarPlan.filter((id) => id !== node.id), reduxStateRef.current));
      return;
    }
    if (isPlanEligible(node, altarPlan, byId)) {
      dispatch(setAltarPlan([...altarPlan, node.id], reduxStateRef.current));
    }
  };

  const confirmCascade = () => {
    const removeIds = [cascadeWarning.nodeId, ...cascadeWarning.affectedIds];
    if (cascadeWarning.mode === 'plan') {
      dispatch(setAltarPlan(altarPlan.filter((id) => !removeIds.includes(id)), reduxStateRef.current));
    } else {
      dispatch(setAltarCascade(removeIds, reduxStateRef.current));
    }
    setCascadeWarning(null);
  };

  // Loading a curated route is just setting altarPlan wholesale — once it's
  // loaded it's an ordinary plan, editable the same way as one built by hand
  // (including the cascade-on-remove behavior above). Confirm first if doing
  // so would actually overwrite existing plan progress.
  const requestLoadRoute = (suggested) => {
    if (altarPlan.length > 0) {
      setRouteToLoad(suggested);
      return;
    }
    dispatch(setAltarPlan(suggested.route, reduxStateRef.current));
  };
  const confirmLoadRoute = () => {
    dispatch(setAltarPlan(routeToLoad.route, reduxStateRef.current));
    setRouteToLoad(null);
  };

  // Saving overwrites any existing entry with the same name — same "Save As"
  // convention most apps use, rather than a separate confirm step.
  const confirmSavePlan = () => {
    const name = newPlanName.trim();
    if (!name) return;
    const withoutExisting = altarSavedPlans.filter((p) => p.name !== name);
    dispatch(setAltarSavedPlans([...withoutExisting, { name, plan: altarPlan }], reduxStateRef.current));
    setSavePlanPrompt(false);
    setNewPlanName('');
  };
  const deleteSavedPlan = (name) => {
    dispatch(setAltarSavedPlans(altarSavedPlans.filter((p) => p.name !== name), reduxStateRef.current));
  };

  // The dedicated Clear control — same overwrite-confirm mechanism as loading
  // any other route, just loading an empty one. Replaces "click the root node
  // to cascade everything away," which worked but was never the intended way
  // to reset the board.
  const handleClearPlan = () => {
    requestLoadRoute({ key: 'clear', label: 'an empty plan', route: [] });
  };

  // Same breakpoint the app already uses to switch from BottomNav to Sidebar.
  const isWide = reduxState.width >= 768;
  // In this specific band the Seal ladder column plus the tree don't leave enough
  // room for the floating Potion Cost box to avoid sitting on top of nodes. Below
  // it the ladder isn't beside the tree yet; above it there's enough width that
  // the floating box clears the nodes on its own, so only this range needs help.
  const potionBoxBelowTree = reduxState.width >= 768 && reduxState.width <= 1050;

  const potionCostBox = (floating) => (
    <div style={{
      ...(floating
        ? { position: 'absolute', top: 6, left: 6, zIndex: 6 }
        : { position: 'static', margin: '20px auto 0' }),
      width: 'fit-content',
      backgroundColor: '#161618', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--r-md)', padding: '6px 8px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <span style={{ fontSize: 11, fontWeight: '700', color: 'var(--text)', letterSpacing: '0.04em', textAlign: 'center' }}>
        Potion Cost
      </span>
      <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: -2, textAlign: 'center' }}>
        Primordial Ashes
      </span>
      <div style={{ display: 'flex', gap: 8, marginTop: 2, justifyContent: 'center' }}>
        {altarPotionCostSequence.map((cost, i) => {
          const claimed = i < unlockedPotionCount;
          const current = i === unlockedPotionCount;
          return (
            <div key={i} title={cost} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <FaFlask
                size={22}
                style={{
                  color: claimed ? `rgb(${ACCENT.potion})` : current ? `rgba(${ACCENT.potion},0.65)` : 'rgba(255,255,255,0.35)',
                  filter: claimed ? `drop-shadow(0 0 4px rgba(${ACCENT.potion},0.6))` : 'none',
                }}
              />
              <span style={{ fontSize: 10, color: claimed ? 'var(--text-dim)' : 'var(--text-muted)' }}>
                {cost.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const costLadder = (
    <div style={{ flexShrink: 0, width: isWide ? 300 : '100%', padding: isWide ? '12px 0 24px 16px' : '4px 16px 24px' }}>
      <h3 style={{ fontSize: 13, fontWeight: '700', color: 'var(--text)', letterSpacing: '0.04em' }}>
        Seal Unlock Cost Ladder
      </h3>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, marginBottom: 12 }}>
        Same cost no matter which eligible Seal you pick — this is your {unlockedSealCount < 26 ? `${unlockedSealCount + 1}` : 'final'} Seal unlock.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Spent rungs collapse behind a summary so the list doesn't grow taller
            (and need scrolling to find the next target) as you progress. */}
        {unlockedSealCount > 0 && (
          <button
            onClick={() => setShowSpentCosts(!showSpentCosts)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', marginBottom: 2,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 11,
            }}
          >
            {showSpentCosts ? <FaChevronDown size={9} /> : <FaChevronRight size={9} />}
            <span>{unlockedSealCount} already unlocked</span>
          </button>
        )}
        {altarSealCostSequence.map((cost, i) => {
          const spent = i < unlockedSealCount;
          const current = i === unlockedSealCount;
          if (spent && !showSpentCosts) return null;
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: '700', color: 'var(--text)', letterSpacing: '0.04em' }}>
            Altar of Rites
          </h2>
          <button
            onClick={() => setPlanningMode(!planningMode)}
            style={{
              flexShrink: 0, height: 32, padding: '0 12px',
              backgroundColor: planningMode ? `rgba(${PLAN_ACCENT},0.18)` : 'var(--bg-raised)',
              border: `1px solid ${planningMode ? `rgb(${PLAN_ACCENT})` : 'var(--border-subtle)'}`,
              borderRadius: 'var(--r-md)',
              color: planningMode ? `rgb(${PLAN_ACCENT})` : 'var(--text-dim)',
              fontSize: 12, fontWeight: '700', letterSpacing: '0.04em',
              cursor: 'pointer',
            }}
          >
            {planningMode ? 'Exit Planning' : 'Plan'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          {planningMode
            ? 'Tap a node to add or remove it from your plan, in the order you want to take them.'
            : (nextSealId || nextPotionId)
              ? <>Tap a node to unlock or undo it. <span style={{ color: `rgb(${PLAN_ACCENT})` }}>{nextSealId && nextPotionId ? 'The glowing nodes are' : 'The glowing node is'}</span> next on your plan.</>
              : 'Tap a node to unlock or undo it. Hover for the full effect and cost.'}
        </p>

        {planningMode && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>
              Load a suggested route:
            </span>
            {SUGGESTED_ROUTES.map((suggested) => (
              <button
                key={suggested.key}
                onClick={() => requestLoadRoute(suggested)}
                style={{
                  height: 28, padding: '0 10px',
                  backgroundColor: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-sm)', color: 'var(--text-dim)',
                  fontSize: 11, fontWeight: '700', cursor: 'pointer',
                }}
              >
                {suggested.label}
              </button>
            ))}
          </div>
        )}

        {planningMode && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setSavePlanPrompt(true)}
              disabled={altarPlan.length === 0}
              style={{
                height: 28, padding: '0 10px',
                display: 'flex', alignItems: 'center', gap: 6,
                backgroundColor: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-sm)',
                color: altarPlan.length === 0 ? 'var(--text-muted)' : 'var(--text-dim)',
                fontSize: 11, fontWeight: '700',
                cursor: altarPlan.length === 0 ? 'not-allowed' : 'pointer',
                opacity: altarPlan.length === 0 ? 0.5 : 1,
              }}
            >
              <FaSave size={10} /> Save Plan
            </button>
            <button
              onClick={handleClearPlan}
              disabled={altarPlan.length === 0}
              style={{
                height: 28, padding: '0 10px',
                display: 'flex', alignItems: 'center', gap: 6,
                backgroundColor: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-sm)',
                color: altarPlan.length === 0 ? 'var(--text-muted)' : 'var(--text-dim)',
                fontSize: 11, fontWeight: '700',
                cursor: altarPlan.length === 0 ? 'not-allowed' : 'pointer',
                opacity: altarPlan.length === 0 ? 0.5 : 1,
              }}
            >
              <FaTimes size={10} /> Clear
            </button>
          </div>
        )}

        {planningMode && altarSavedPlans.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>
              Your saved plans:
            </span>
            {altarSavedPlans.map((saved) => (
              <div
                key={saved.name}
                style={{
                  height: 28, display: 'flex', alignItems: 'center',
                  backgroundColor: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-sm)', overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => requestLoadRoute({ key: saved.name, label: saved.name, route: saved.plan })}
                  style={{
                    height: '100%', padding: '0 10px',
                    background: 'none', border: 'none',
                    color: 'var(--text-dim)', fontSize: 11, fontWeight: '700', cursor: 'pointer',
                  }}
                >
                  {saved.name}
                </button>
                <button
                  onClick={() => deleteSavedPlan(saved.name)}
                  title={`Delete "${saved.name}"`}
                  style={{
                    height: '100%', padding: '0 8px',
                    background: 'none', border: 'none', borderLeft: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <FaTrash size={9} />
                </button>
              </div>
            ))}
          </div>
        )}

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
        <div style={{ flex: 1, minWidth: 0, padding: '24px 8px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 750,
          aspectRatio: `${bounds.w} / ${bounds.h}`,
          containerType: 'inline-size',
        }}>

          {/* Potion Power Ashes cost — separate 3-step pool from the Seal ladder,
              same "Nth unlock" mechanic. Floats top-left of the tree panel except
              in the 768-1050px band, where there isn't room for it to clear the
              nodes, so it drops below the tree there instead. */}
          {!potionBoxBelowTree && potionCostBox(true)}

          {/* Edges */}
          <svg
            viewBox={`${bounds.minX} ${bounds.minY} ${bounds.w} ${bounds.h}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            {altarProgress.map((node) =>
              node.requires.map((reqId) => {
                const from = byId[reqId];
                const active = from?.unlocked;

                if (planningMode) {
                  const destPlanned = altarPlan.includes(node.id);
                  const destPlanReady = !destPlanned && isPlanEligible(node, altarPlan, byId);
                  return (
                    <line
                      key={`${reqId}-${node.id}`}
                      x1={from.x} y1={from.y} x2={node.x} y2={node.y}
                      stroke={destPlanned ? `rgba(${PLAN_ACCENT},0.9)` : destPlanReady ? `rgba(${PLAN_ACCENT},0.5)` : 'rgba(196,18,48,0.45)'}
                      strokeWidth={destPlanned || destPlanReady ? 3 : 2}
                      opacity={destPlanned || destPlanReady ? 0.95 : 0.85}
                    />
                  );
                }

                // A live path (source unlocked) that leads to a node not yet
                // unlocked itself is an actionable route right now — a medium
                // version of the destination's own accent, sitting between the
                // dim "not yet" lines and the full-bright "done" ones, rather
                // than a separate hue that doesn't fit the rest of the palette.
                const ready = active && !node.unlocked;
                return (
                  <line
                    key={`${reqId}-${node.id}`}
                    x1={from.x} y1={from.y} x2={node.x} y2={node.y}
                    stroke={ready ? `rgba(${ACCENT[node.type]},0.7)` : active ? 'var(--red-bright)' : 'rgba(196,18,48,0.45)'}
                    strokeWidth={ready || active ? 3 : 2}
                    opacity={ready || active ? 0.95 : 0.85}
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

            // Planning-mode state is a separate hypothetical layer on top of real
            // progress: already-real nodes have nothing left to plan, the final
            // bonus isn't a choice, and "ready to plan" depends on the plan-so-far
            // rather than what's really unlocked.
            // Badge number is this node's position within its OWN type's planned
            // order, not its position in the combined array — Seals and Potions
            // are independent sequences, so "5th overall" wouldn't mean anything.
            const sameTypePlan = altarPlan.filter((id) => byId[id]?.type === node.type);
            const planIndex = sameTypePlan.indexOf(node.id);
            const planned = planIndex !== -1;
            const planDone = planningMode && node.unlocked;
            const planReady = planningMode && !planned && !node.unlocked && node.type !== 'final' && isPlanEligible(node, altarPlan, byId);
            const planInactive = planningMode && !planned && !planDone && !planReady;
            // The plan's "what to do next in-game" callout — only meaningful in
            // the normal view, since planning mode already shows the full order.
            const isNext = !planningMode && (node.id === nextSealId || node.id === nextPotionId);

            return (
              // The button's box is centered exactly on the coordinate point — the
              // dot sits centered inside it, so the dot's center always matches the
              // line endpoint. The label is an absolutely-positioned child anchored
              // to the button's edge, so it can't pull the dot off-point.
              <button
                key={node.id}
                onClick={() => (planningMode ? handlePlanClick(node) : handleNodeClick(node))}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: 'absolute',
                  left: `${leftPct}%`, top: `${topPct}%`,
                  width: HIT_SIZE, height: HIT_SIZE,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', padding: 0,
                  cursor: planningMode ? (planDone || planInactive ? 'default' : 'pointer') : (node.type === 'final' ? 'default' : 'pointer'),
                  opacity: planningMode ? (planDone || planInactive ? 0.4 : 1) : (eligible ? 1 : 0.85),
                  zIndex: hovered ? 5 : 1,
                }}
              >
                <div style={{
                  width: DOT_SIZE, height: DOT_SIZE, borderRadius: '50%', flexShrink: 0,
                  backgroundColor: planningMode
                    ? (planned ? `rgb(${PLAN_ACCENT})` : planReady ? `rgba(${PLAN_ACCENT},0.22)` : 'rgba(255,255,255,0.07)')
                    : (node.unlocked ? `rgb(${accent})` : eligible ? `rgba(${accent},0.22)` : 'rgba(255,255,255,0.07)'),
                  border: planningMode
                    ? `2.5px solid ${planned ? `rgb(${PLAN_ACCENT})` : planReady ? `rgba(${PLAN_ACCENT},0.65)` : 'rgba(255,255,255,0.35)'}`
                    : `2.5px solid ${node.unlocked ? `rgb(${accent})` : eligible ? `rgba(${accent},0.65)` : 'rgba(255,255,255,0.35)'}`,
                  boxShadow: isNext ? `0 0 0 3px rgba(${PLAN_ACCENT},0.35), 0 0 14px 4px rgba(${PLAN_ACCENT},0.8)` : 'none',
                }} />
                {planned && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2,
                    minWidth: 14, height: 14, borderRadius: 7, padding: '0 3px',
                    backgroundColor: '#161618', border: `1.5px solid rgb(${PLAN_ACCENT})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, fontWeight: '700', color: `rgb(${PLAN_ACCENT})`,
                  }}>
                    {planIndex + 1}
                  </span>
                )}
                <span style={{
                  position: 'absolute',
                  left: '50%', transform: 'translateX(-50%)',
                  ...(above ? { bottom: 'calc(100% + 2px)' } : { top: 'calc(100% + 2px)' }),
                  fontSize: LABEL_SIZE, fontWeight: '600', lineHeight: 1.3, textAlign: 'center',
                  width: hovered ? 200 : LABEL_WIDTH,
                  color: planningMode ? (planned || planReady ? 'var(--text)' : 'var(--text-dim)') : (node.unlocked || eligible ? 'var(--text)' : 'var(--text-dim)'),
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
                  {hovered ? (
                    <>
                      <span style={{ display: 'block', fontWeight: '700', marginBottom: 4 }}>
                        {node.name}
                      </span>
                      {node.type === 'final' ? `${node.effect}\n\n${node.cost.join(', ')}` : node.effect}
                    </>
                  ) : node.description}
                </span>
              </button>
            );
          })}
        </div>
        {potionBoxBelowTree && potionCostBox(false)}
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
              This will also {cascadeWarning.mode === 'plan' ? 'unplan' : 'lock'} {cascadeWarning.affectedIds.length} other node{cascadeWarning.affectedIds.length === 1 ? '' : 's'}
            </span>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {cascadeWarning.mode === 'plan'
                ? "These were only plannable through the node you're removing, directly or further down the chain — none of them have another planned or real path left:"
                : "These were only unlocked through the node you're locking, directly or further down the chain — none of them have another open path left:"}
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
                {cascadeWarning.mode === 'plan' ? 'Unplan Them All' : 'Lock Them All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save-plan name prompt */}
      {savePlanPrompt && (
        <div
          onClick={() => setSavePlanPrompt(false)}
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
              Save this plan
            </span>
            <input
              autoFocus
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmSavePlan(); }}
              placeholder="Name this plan..."
              style={{
                height: 40, padding: '0 12px',
                backgroundColor: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-md)', color: 'var(--text)', fontSize: 14,
                outline: 'none',
              }}
            />
            {altarSavedPlans.some((p) => p.name === newPlanName.trim()) && newPlanName.trim() && (
              <span style={{ fontSize: 11, color: 'var(--gold-bright)' }}>
                A saved plan with this name already exists — saving will overwrite it.
              </span>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => { setSavePlanPrompt(false); setNewPlanName(''); }}
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
                onClick={confirmSavePlan}
                disabled={!newPlanName.trim()}
                style={{
                  flex: 1, height: 42,
                  background: newPlanName.trim() ? `linear-gradient(to right, rgb(${PLAN_ACCENT}), rgba(${PLAN_ACCENT},0.7))` : 'var(--bg-raised)',
                  border: `1px solid ${newPlanName.trim() ? `rgb(${PLAN_ACCENT})` : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--r-md)',
                  color: newPlanName.trim() ? 'white' : 'var(--text-muted)',
                  fontSize: 13, fontWeight: '700',
                  cursor: newPlanName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Route-load overwrite warning — only shown when there's an existing
          plan to actually lose; an empty plan loads the route immediately. */}
      {routeToLoad && (
        <div
          onClick={() => setRouteToLoad(null)}
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
              {routeToLoad.key === 'clear' ? 'Clear your plan?' : 'Replace your current plan?'}
            </span>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {routeToLoad.key === 'clear'
                ? `This will remove all ${altarPlan.length} nodes from your current plan. This doesn't touch anything you've actually unlocked.`
                : `Loading the ${routeToLoad.label} route will overwrite your existing ${altarPlan.length}-node plan. This doesn't touch anything you've actually unlocked.`}
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => setRouteToLoad(null)}
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
                onClick={confirmLoadRoute}
                style={{
                  flex: 1, height: 42,
                  background: `linear-gradient(to right, rgb(${PLAN_ACCENT}), rgba(${PLAN_ACCENT},0.7))`,
                  border: `1px solid rgb(${PLAN_ACCENT})`,
                  borderRadius: 'var(--r-md)', color: 'white',
                  fontSize: 13, fontWeight: '700', cursor: 'pointer',
                }}
              >
                {routeToLoad.key === 'clear' ? 'Clear Plan' : 'Load Route'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlterOfRites;
