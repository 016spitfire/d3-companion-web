import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import { FaList, FaFire, FaCheck, FaEye, FaEyeSlash, FaGift, FaUndo } from 'react-icons/fa';
import {
  selectReduxSlice,
  setJourneyProgress,
  setJourneyCascade,
  setAltarProgress,
  setAltarCascade,
  setTrackerData,
  setClaimsToday,
} from '../store/store';
import { altarSealCostSequence, altarPotionCostSequence } from '../data/altarOfRitesData';
import { computeCascadeLocks } from '../utils/altarCascade';
import { computeJourneyCascadeUncompletes } from '../utils/journeyCascade';

const parseDate = (str) => {
  const year = new Date().getFullYear();
  let parsed = DateTime.fromFormat(`${str} ${year}`, 'MMM d yyyy');
  if (!parsed.isValid) return null;
  if (parsed.diff(DateTime.now(), 'months').months > 6) {
    parsed = DateTime.fromFormat(`${str} ${year - 1}`, 'MMM d yyyy');
  }
  return parsed;
};

const getNextClaimDate = (history, startDate) => {
  if (!startDate) return null;
  if (history.length === 0) return startDate;
  const parsed = parseDate(history[history.length - 1].date);
  if (!parsed) return startDate;
  return parsed.plus({ days: 1 }).toLocaleString({ month: 'short', day: 'numeric' });
};

const StatCard = ({ label, value }) => (
  <div
    style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      padding: '14px 8px',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--r-md)',
    }}
  >
    <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      {label}
    </span>
    <span style={{ fontSize: 32, fontWeight: '700', color: 'var(--gold-bright)', lineHeight: 1 }}>
      {value}
    </span>
  </div>
);

const SectionHeader = ({ Icon, title, right }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <Icon size={12} style={{ color: 'var(--red-bright)', flexShrink: 0 }} />
    <span style={{ flex: 1, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      {title}
    </span>
    {right}
  </div>
);

const UndoLink = ({ label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      alignSelf: 'flex-start',
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 11, color: 'var(--text-muted)',
      background: 'none', border: 'none', cursor: 'pointer', padding: '4px 2px',
    }}
  >
    <FaUndo size={10} />
    {label}
  </button>
);

// Shared shape for "this action will also affect N other things" confirms —
// used for both re-locking an Altar node and unchecking a Season Journey
// task, since both can strand other progress that depended on the one thing
// being undone.
const CascadeWarningModal = ({ title, body, chips, onCancel, onConfirm, confirmLabel }) => (
  <div
    onClick={onCancel}
    style={{
      position: 'fixed', inset: 0, zIndex: 10,
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
      <span style={{ fontSize: 15, fontWeight: '700', color: 'var(--text)' }}>{title}</span>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{body}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {chips.map((chip) => (
          <span key={chip} style={{
            fontSize: 12, fontWeight: '600', color: 'var(--text-dim)',
            backgroundColor: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-sm)', padding: '3px 8px',
          }}>
            {chip}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
        <button
          onClick={onCancel}
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
          onClick={onConfirm}
          style={{
            flex: 1, height: 42,
            background: 'linear-gradient(to right, var(--red), #8b0000)',
            border: '1px solid var(--red-dim)',
            borderRadius: 'var(--r-md)', color: 'white',
            fontSize: 13, fontWeight: '700', cursor: 'pointer',
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  </div>
);

const Welcome = () => {
  const TodayLong = DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const dispatch = useDispatch();
  const reduxState = useSelector(selectReduxSlice);
  const reduxStateRef = useRef(reduxState);
  reduxStateRef.current = reduxState;

  const [showCompletedJourney, setShowCompletedJourney] = useState(false);
  const [journeyView, setJourneyView] = useState('chapter'); // 'chapter' | 'curated'
  const [altarUndoWarning, setAltarUndoWarning] = useState(null); // { node, affectedIds } | null
  const [journeyUndoWarning, setJourneyUndoWarning] = useState(null); // { task, affectedKeys } | null

  // ---- Season Journey: chapter view (the linear story path) ----
  const chapterTasks = reduxState.journeyProgress.filter((t) => t.chapter === reduxState.currentChapter);
  const visibleChapterTasks = showCompletedJourney ? chapterTasks : chapterTasks.filter((t) => !t.completed);
  const completedInChapter = chapterTasks.filter((t) => t.completed).length;

  // ---- Season Journey: curated view (the tailored progress tree) ----
  // "Ready" means every curatedRequires entry is already done — curatedRequires
  // always includes the real requires chain plus extra pacing-only gates for
  // tasks with no real prerequisite, so this is never less restrictive than
  // what's mechanically true, just more deliberately paced. Chapter is ignored
  // entirely here; a task shows the moment its curated gate clears regardless
  // of which chapter it's filed under.
  const journeyByKey = Object.fromEntries(reduxState.journeyProgress.map((t) => [t.key, t]));
  const curatedReadyTasks = reduxState.journeyProgress
    .filter((t) => !t.completed && t.curatedRequires.every((id) => journeyByKey[id]?.completed))
    .sort((a, b) => a.key - b.key);
  const curatedCompletedTasks = reduxState.journeyProgress.filter((t) => t.completed).sort((a, b) => a.key - b.key);
  const visibleCuratedTasks = showCompletedJourney ? [...curatedReadyTasks, ...curatedCompletedTasks] : curatedReadyTasks;
  const totalJourneyCompleted = curatedCompletedTasks.length;

  // Checking a task complete also completes its chain (handled inside the
  // thunk). Unchecking is safe immediately unless something already
  // completed only stayed that way because of this one (e.g. unchecking
  // GR20 Solo while GR30+ are checked) — same split as the Altar undo above.
  const handleJourneyTaskClick = (task) => {
    if (task.completed) {
      const affected = computeJourneyCascadeUncompletes(task.key, reduxState.journeyProgress);
      if (affected.length > 0) {
        setJourneyUndoWarning({ task, affectedKeys: affected });
        return;
      }
    }
    dispatch(setJourneyProgress({ val: task, currentState: reduxStateRef.current }));
  };
  const confirmJourneyCascade = () => {
    dispatch(setJourneyCascade([journeyUndoWarning.task.key, ...journeyUndoWarning.affectedKeys], reduxStateRef.current));
    setJourneyUndoWarning(null);
  };

  // ---- Altar of Rites: follow the planned path if one exists ----
  const byId = Object.fromEntries(reduxState.altarProgress.map((n) => [n.id, n]));
  const planSealId = reduxState.altarPlan.find((id) => byId[id]?.type === 'seal' && !byId[id]?.unlocked);
  const planPotionId = reduxState.altarPlan.find((id) => byId[id]?.type === 'potion' && !byId[id]?.unlocked);

  const unlockedSealCount = reduxState.altarProgress.filter((n) => n.type === 'seal' && n.unlocked).length;
  const unlockedPotionCount = reduxState.altarProgress.filter((n) => n.type === 'potion' && n.unlocked).length;
  const nextSealCost = unlockedSealCount < altarSealCostSequence.length ? altarSealCostSequence[unlockedSealCount] : null;
  const nextPotionCost = unlockedPotionCount < altarPotionCostSequence.length ? altarPotionCostSequence[unlockedPotionCount] : null;

  const nextSealNode = planSealId !== undefined ? byId[planSealId] : null;
  const nextPotionNode = planPotionId !== undefined ? byId[planPotionId] : null;

  // The most recently completed step of the plan, in plan order — there's no
  // unlock timestamp stored, so "previous" means "last plan-ordered node that's
  // actually unlocked," same idea as "next" means "first one that isn't yet."
  const unlockedPlanSealIds = reduxState.altarPlan.filter((id) => byId[id]?.type === 'seal' && byId[id]?.unlocked);
  const unlockedPlanPotionIds = reduxState.altarPlan.filter((id) => byId[id]?.type === 'potion' && byId[id]?.unlocked);
  const prevSealNode = unlockedPlanSealIds.length > 0 ? byId[unlockedPlanSealIds[unlockedPlanSealIds.length - 1]] : null;
  const prevPotionNode = unlockedPlanPotionIds.length > 0 ? byId[unlockedPlanPotionIds[unlockedPlanPotionIds.length - 1]] : null;

  const unlockAltarNode = (node) => {
    if (!node) return;
    dispatch(setAltarProgress({ val: node, currentState: reduxStateRef.current }));
  };

  // Re-locking can strand other nodes that were only unlocked through this one
  // (same risk as locking from the Altar screen itself) — hold off and confirm
  // instead of silently wiping out other progress if that would happen.
  const requestUndoAltarNode = (node) => {
    if (!node) return;
    const affectedIds = computeCascadeLocks(node.id, reduxState.altarProgress);
    if (affectedIds.length > 0) {
      setAltarUndoWarning({ node, affectedIds });
      return;
    }
    dispatch(setAltarProgress({ val: node, currentState: reduxStateRef.current }));
  };
  const confirmUndoAltarNode = () => {
    dispatch(setAltarCascade([altarUndoWarning.node.id, ...altarUndoWarning.affectedIds], reduxStateRef.current));
    setAltarUndoWarning(null);
  };

  // ---- Paragon: next goal, click-to-claim, same-day bonus marking ----
  const todaysGoal = reduxState.playQueue?.[0];
  const todayISO = DateTime.now().toISODate();
  const claimsToday = reduxState.claimsToday;
  const claimedToday = claimsToday.date === todayISO && claimsToday.count > 0;
  const bonusToday = claimsToday.date === todayISO && claimsToday.count > 1;

  const claimParagonGoal = () => {
    const state = reduxStateRef.current;
    const nextDate = getNextClaimDate(state.history, state.startDate);
    if (!nextDate || state.playQueue.length === 0) return;
    const item = state.playQueue[0];
    dispatch(setTrackerData({
      playQueue: state.playQueue.slice(1),
      restQueue: state.restQueue,
      history: [...state.history, { type: 'play', date: nextDate, level: item.level, difference: item.difference }],
    }, state));
    const newCount = state.claimsToday.date === todayISO ? state.claimsToday.count + 1 : 1;
    dispatch(setClaimsToday({ date: todayISO, count: newCount }, state));
  };

  // Unwinds the single most recent history entry back onto its queue — same
  // approach as ParagonTracker's deleteEntry, just always targeting the tail.
  // Only decrements today's claim count if that entry was actually claimed
  // today; an entry from a previous day leaves today's count alone.
  const undoLastClaim = () => {
    const state = reduxStateRef.current;
    if (state.history.length === 0) return;
    const last = state.history[state.history.length - 1];
    const newHistory = state.history.slice(0, -1);
    const playQueue = last.type === 'play'
      ? [{ level: last.level, difference: last.difference, goal: 0 }, ...state.playQueue]
      : state.playQueue;
    const restQueue = last.type === 'rest'
      ? [{ key: 0 }, ...state.restQueue]
      : state.restQueue;
    dispatch(setTrackerData({ playQueue, restQueue, history: newHistory }, state));
    if (state.claimsToday.date === todayISO && state.claimsToday.count > 0) {
      dispatch(setClaimsToday({ date: todayISO, count: state.claimsToday.count - 1 }, state));
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'var(--bg-base)',
        paddingBottom: 24,
        position: 'relative',
      }}
    >
      {/* Date header */}
      <div
        style={{
          width: '100%',
          padding: '10px 0',
          display: 'flex',
          justifyContent: 'center',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: 24,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {TodayLong}
        </span>
      </div>

      <div style={{ width: '100%', maxWidth: 640, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Paragon stats */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionHeader Icon={FaList} title="Today's Paragon" />
          <div style={{ display: 'flex', gap: 10 }}>
            <StatCard label="Non-Season" value={reduxState.currentParagons} />
            <StatCard label="Season" value={reduxState.seasonParagon} />
            <StatCard label="Next Goal" value={todaysGoal ? `P ${todaysGoal.level}` : '—'} />
          </div>

          {todaysGoal && (
            <button
              onClick={claimParagonGoal}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                backgroundColor: claimedToday && bonusToday ? 'rgba(255,215,0,0.08)' : 'var(--bg-surface)',
                border: '1px solid',
                borderColor: claimedToday && bonusToday ? 'rgba(255,215,0,0.4)' : 'var(--border-subtle)',
                borderLeft: '3px solid',
                borderLeftColor: claimedToday && bonusToday ? 'gold' : 'var(--red-dim)',
                borderRadius: 'var(--r-md)',
                cursor: 'pointer',
              }}
            >
              {claimedToday && bonusToday ? (
                <FaGift size={14} style={{ color: 'gold', flexShrink: 0 }} />
              ) : (
                <FaCheck size={14} style={{ color: claimedToday ? 'var(--gold-bright)' : 'var(--red-bright)', flexShrink: 0 }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: '700', color: 'var(--text)' }}>
                  {claimedToday
                    ? (bonusToday ? 'Bonus goal claimed — ahead of pace!' : "Today's goal complete!")
                    : `Claim Paragon ${todaysGoal.level} (+${todaysGoal.difference})`}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {claimedToday
                    ? `Next up: Paragon ${todaysGoal.level} (+${todaysGoal.difference})`
                    : 'Tap to mark today\'s goal as done'}
                </span>
              </div>
            </button>
          )}

          {reduxState.history.length > 0 && (
            <UndoLink label="Undo last claim" onClick={undoLastClaim} />
          )}
        </section>

        {/* Season Journey — chapter view or curated view */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionHeader
            Icon={FaList}
            title={journeyView === 'chapter'
              ? `Season Journey — ${reduxState.currentChapter} (${completedInChapter}/${chapterTasks.length})`
              : `Season Journey — Curated (${curatedReadyTasks.length} ready, ${totalJourneyCompleted}/${reduxState.journeyProgress.length} overall)`}
            right={
              <button
                onClick={() => setShowCompletedJourney((s) => !s)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 11, color: 'var(--text-muted)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                }}
              >
                {showCompletedJourney ? <FaEyeSlash size={11} /> : <FaEye size={11} />}
                {showCompletedJourney ? 'Hide completed' : 'Show completed'}
              </button>
            }
          />

          <div style={{ display: 'flex', gap: 6 }}>
            {[{ key: 'chapter', label: 'By Chapter' }, { key: 'curated', label: 'Curated' }].map((v) => (
              <button
                key={v.key}
                onClick={() => setJourneyView(v.key)}
                style={{
                  flex: 1, padding: '8px 0',
                  fontSize: 12, fontWeight: '700',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid',
                  borderColor: journeyView === v.key ? 'var(--red-bright)' : 'var(--border-subtle)',
                  backgroundColor: journeyView === v.key ? 'rgba(196,18,48,0.12)' : 'var(--bg-surface)',
                  color: journeyView === v.key ? 'var(--text)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {journeyView === 'chapter' && visibleChapterTasks.length === 0 && (
              <span style={{ fontSize: 13, color: 'var(--gold-bright)', padding: '8px 4px' }}>
                All {reduxState.currentChapter} tasks complete!
              </span>
            )}
            {journeyView === 'curated' && visibleCuratedTasks.length === 0 && (
              <span style={{ fontSize: 13, color: 'var(--gold-bright)', padding: '8px 4px' }}>
                {totalJourneyCompleted === reduxState.journeyProgress.length
                  ? 'All Season Journey tasks complete!'
                  : 'Nothing new ready yet — keep pushing your current tasks!'}
              </span>
            )}
            {(journeyView === 'chapter' ? visibleChapterTasks : visibleCuratedTasks).map((task) => (
              <button
                key={task.key}
                onClick={() => handleJourneyTaskClick(task)}
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textAlign: 'left',
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  border: '1px solid',
                  borderColor: task.completed ? 'rgba(196,18,48,0.3)' : 'var(--border-subtle)',
                  backgroundColor: task.completed ? 'rgba(196,18,48,0.07)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: '1px solid',
                    borderColor: task.completed ? 'var(--red-bright)' : 'var(--border-subtle)',
                    backgroundColor: task.completed ? 'var(--red)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {task.completed && <FaCheck size={8} style={{ color: 'white' }} />}
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: '600',
                    color: task.completed ? 'var(--text-dim)' : 'var(--text)',
                    textDecoration: task.completed ? 'line-through' : 'none',
                    flex: 1,
                  }}>
                    {task.title}
                  </span>
                  {journeyView === 'curated' && (
                    <span style={{
                      fontSize: 10, fontWeight: '700', color: 'var(--text-muted)',
                      letterSpacing: '0.04em', textTransform: 'uppercase',
                      backgroundColor: 'var(--bg-raised)', borderRadius: 'var(--r-sm)', padding: '2px 6px',
                      flexShrink: 0,
                    }}>
                      {task.chapter}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', paddingLeft: 26 }}>
                  {task.goal}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Altar of Rites — plan-aware next node */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionHeader Icon={FaFire} title="Altar of Rites" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Next Seal */}
            <button
              onClick={() => nextSealNode && unlockAltarNode(nextSealNode)}
              disabled={!nextSealNode}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                gap: 4,
                padding: '12px 16px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderLeft: '3px solid rgba(196,18,48,0.6)',
                borderRadius: 'var(--r-md)',
                cursor: nextSealNode ? 'pointer' : 'default',
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Next Seal
              </span>
              {nextSealNode ? (
                <>
                  <span style={{ fontSize: 14, fontWeight: '700', color: 'var(--text)' }}>
                    {nextSealNode.name} — {nextSealNode.description}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{nextSealNode.effect}</span>
                  {nextSealCost && (
                    <span style={{ fontSize: 11, color: 'var(--gold-bright)', fontWeight: '600' }}>
                      Cost: {nextSealCost.join(', ')}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap to unlock</span>
                </>
              ) : (
                <span style={{ fontSize: 13, fontWeight: '600', color: nextSealCost ? 'var(--text)' : 'var(--gold-bright)' }}>
                  {nextSealCost
                    ? `Next cost (${unlockedSealCount}/${altarSealCostSequence.length}): ${nextSealCost.join(', ')}`
                    : 'All Seals unlocked'}
                </span>
              )}
            </button>
            {prevSealNode && (
              <UndoLink label={`Undo ${prevSealNode.name}`} onClick={() => requestUndoAltarNode(prevSealNode)} />
            )}

            {/* Next Potion */}
            <button
              onClick={() => nextPotionNode && unlockAltarNode(nextPotionNode)}
              disabled={!nextPotionNode}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                gap: 4,
                padding: '12px 16px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderLeft: '3px solid rgba(30,200,90,0.6)',
                borderRadius: 'var(--r-md)',
                cursor: nextPotionNode ? 'pointer' : 'default',
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Next Potion Power
              </span>
              {nextPotionNode ? (
                <>
                  <span style={{ fontSize: 14, fontWeight: '700', color: 'var(--text)' }}>
                    {nextPotionNode.name} — {nextPotionNode.description}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{nextPotionNode.effect}</span>
                  {nextPotionCost && (
                    <span style={{ fontSize: 11, color: 'var(--gold-bright)', fontWeight: '600' }}>
                      Cost: {nextPotionCost}
                    </span>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap to unlock</span>
                </>
              ) : (
                <span style={{ fontSize: 13, fontWeight: '600', color: nextPotionCost ? 'var(--text)' : 'var(--gold-bright)' }}>
                  {nextPotionCost
                    ? `Next cost (${unlockedPotionCount}/${altarPotionCostSequence.length}): ${nextPotionCost}`
                    : 'All Potion Powers unlocked'}
                </span>
              )}
            </button>
            {prevPotionNode && (
              <UndoLink label={`Undo ${prevPotionNode.name}`} onClick={() => requestUndoAltarNode(prevPotionNode)} />
            )}
          </div>
        </section>

      </div>

      {/* Cascade warnings — shown instead of acting immediately whenever it
          would strand other progress that depended on the thing being undone. */}
      {altarUndoWarning && (
        <CascadeWarningModal
          title={`This will also lock ${altarUndoWarning.affectedIds.length} other node${altarUndoWarning.affectedIds.length === 1 ? '' : 's'}`}
          body={`These were only unlocked through ${altarUndoWarning.node.name}, directly or further down the chain — none of them have another open path left:`}
          chips={altarUndoWarning.affectedIds.map((id) => byId[id]?.name)}
          onCancel={() => setAltarUndoWarning(null)}
          onConfirm={confirmUndoAltarNode}
          confirmLabel="Lock Them All"
        />
      )}
      {journeyUndoWarning && (
        <CascadeWarningModal
          title={`This will also uncheck ${journeyUndoWarning.affectedKeys.length} other task${journeyUndoWarning.affectedKeys.length === 1 ? '' : 's'}`}
          body={`These were only complete because ${journeyUndoWarning.task.title} was — none of them could really be done without it:`}
          chips={journeyUndoWarning.affectedKeys.map((key) => reduxState.journeyProgress.find((t) => t.key === key)?.title)}
          onCancel={() => setJourneyUndoWarning(null)}
          onConfirm={confirmJourneyCascade}
          confirmLabel="Uncheck Them All"
        />
      )}
    </div>
  );
};

export default Welcome;
