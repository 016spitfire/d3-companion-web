import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import { FaList, FaFire, FaCheck, FaEye, FaEyeSlash, FaGift } from 'react-icons/fa';
import {
  selectReduxSlice,
  setJourneyProgress,
  setAltarProgress,
  setTrackerData,
  setLastClaimDate,
} from '../store/store';
import { altarSealCostSequence, altarPotionCostSequence } from '../data/altarOfRitesData';

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

const Welcome = () => {
  const TodayLong = DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const dispatch = useDispatch();
  const reduxState = useSelector(selectReduxSlice);
  const reduxStateRef = useRef(reduxState);
  reduxStateRef.current = reduxState;

  const [showCompletedJourney, setShowCompletedJourney] = useState(false);
  const [justClaimedBonus, setJustClaimedBonus] = useState(false);

  // ---- Season Journey: full current-chapter task list ----
  const chapterTasks = reduxState.journeyProgress.filter((t) => t.chapter === reduxState.currentChapter);
  const visibleChapterTasks = showCompletedJourney ? chapterTasks : chapterTasks.filter((t) => !t.completed);
  const completedInChapter = chapterTasks.filter((t) => t.completed).length;

  const toggleJourneyTask = (task) => {
    dispatch(setJourneyProgress({ val: task, currentState: reduxStateRef.current }));
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

  const unlockAltarNode = (node) => {
    if (!node) return;
    dispatch(setAltarProgress({ val: node, currentState: reduxStateRef.current }));
  };

  // ---- Paragon: next goal, click-to-claim, same-day bonus marking ----
  const todaysGoal = reduxState.playQueue?.[0];
  const todayISO = DateTime.now().toISODate();
  const claimedToday = reduxState.lastClaimDate === todayISO;

  const claimParagonGoal = () => {
    const state = reduxStateRef.current;
    const nextDate = getNextClaimDate(state.history, state.startDate);
    if (!nextDate || state.playQueue.length === 0) return;
    const item = state.playQueue[0];
    const wasAlreadyClaimedToday = state.lastClaimDate === todayISO;
    dispatch(setTrackerData({
      playQueue: state.playQueue.slice(1),
      restQueue: state.restQueue,
      history: [...state.history, { type: 'play', date: nextDate, level: item.level, difference: item.difference }],
    }, state));
    dispatch(setLastClaimDate(todayISO, state));
    setJustClaimedBonus(wasAlreadyClaimedToday);
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
                backgroundColor: claimedToday && justClaimedBonus ? 'rgba(255,215,0,0.08)' : 'var(--bg-surface)',
                border: '1px solid',
                borderColor: claimedToday && justClaimedBonus ? 'rgba(255,215,0,0.4)' : 'var(--border-subtle)',
                borderLeft: '3px solid',
                borderLeftColor: claimedToday && justClaimedBonus ? 'gold' : 'var(--red-dim)',
                borderRadius: 'var(--r-md)',
                cursor: 'pointer',
              }}
            >
              {claimedToday && justClaimedBonus ? (
                <FaGift size={14} style={{ color: 'gold', flexShrink: 0 }} />
              ) : (
                <FaCheck size={14} style={{ color: claimedToday ? 'var(--gold-bright)' : 'var(--red-bright)', flexShrink: 0 }} />
              )}
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', gap: 2 }}>
                <span style={{ fontSize: 13, fontWeight: '700', color: 'var(--text)' }}>
                  {claimedToday
                    ? (justClaimedBonus ? 'Bonus goal claimed — ahead of pace!' : "Today's goal complete!")
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
        </section>

        {/* Season Journey — full chapter list */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SectionHeader
            Icon={FaList}
            title={`Season Journey — ${reduxState.currentChapter} (${completedInChapter}/${chapterTasks.length})`}
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visibleChapterTasks.length === 0 && (
              <span style={{ fontSize: 13, color: 'var(--gold-bright)', padding: '8px 4px' }}>
                All {reduxState.currentChapter} tasks complete!
              </span>
            )}
            {visibleChapterTasks.map((task) => (
              <button
                key={task.key}
                onClick={() => toggleJourneyTask(task)}
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
                  }}>
                    {task.title}
                  </span>
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
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap to unlock</span>
                </>
              ) : (
                <span style={{ fontSize: 13, fontWeight: '600', color: nextPotionCost ? 'var(--text)' : 'var(--gold-bright)' }}>
                  {nextPotionCost
                    ? `Next cost (${unlockedPotionCount}/${altarPotionCostSequence.length}): ${nextPotionCost} Primordial Ashes`
                    : 'All Potion Powers unlocked'}
                </span>
              )}
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Welcome;
