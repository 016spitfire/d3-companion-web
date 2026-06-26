import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import { FaList, FaFire, FaChevronRight } from 'react-icons/fa';
import { selectReduxSlice } from '../store/store';
import { altarSealCostSequence, altarPotionCostSequence } from '../data/altarOfRitesData';

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

// A clickable info card — shows what's next for a given screen and jumps
// there on tap, replacing the old plain navigation button for that screen.
const GoalCard = ({ Icon, title, children, onClick }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      textAlign: 'left',
      gap: 8,
      padding: '14px 16px',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderLeft: '3px solid var(--red-dim)',
      borderRadius: 'var(--r-md)',
      cursor: 'pointer',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon size={14} style={{ color: 'var(--red-bright)', flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 12, fontWeight: '700', color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {title}
      </span>
      <FaChevronRight size={11} style={{ color: 'var(--text-muted)' }} />
    </div>
    {children}
  </button>
);

const Welcome = ({ setScreen }) => {
  const TodayLong  = DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const reduxState     = useSelector(selectReduxSlice);
  const reduxStateRef  = useRef(reduxState);
  reduxStateRef.current = reduxState;

  const [todaysGoal, setTodaysGoal] = useState(undefined);

  useEffect(() => {
    const next = reduxStateRef.current.playQueue?.[0];
    setTodaysGoal(next ?? undefined);
  }, [reduxState.playQueue]);

  // Season Journey — first incomplete task in data order, which already
  // runs low-to-high difficulty (Chapter I -> ... -> Guardian).
  const nextJourneyTask = reduxState.journeyProgress.find((t) => !t.completed);

  // Altar of Rites — Seals and Potions run on independent cost ladders, so
  // each gets its own "next cost" based on how many of that type are
  // unlocked, same logic as the Altar screen itself.
  const unlockedSealCount = reduxState.altarProgress.filter((n) => n.type === 'seal' && n.unlocked).length;
  const unlockedPotionCount = reduxState.altarProgress.filter((n) => n.type === 'potion' && n.unlocked).length;
  const nextSealCost = unlockedSealCount < altarSealCostSequence.length ? altarSealCostSequence[unlockedSealCount] : null;
  const nextPotionCost = unlockedPotionCount < altarPotionCostSequence.length ? altarPotionCostSequence[unlockedPotionCount] : null;

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
        {todaysGoal !== undefined && (
          <section>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              Today&apos;s Paragon
            </span>
            <div style={{ display: 'flex', gap: 10 }}>
              <StatCard label="Non-Season"    value={reduxState.currentParagons} />
              <StatCard label="Season"        value={reduxState.seasonParagon} />
              <StatCard label="Next Goal" value={`P ${todaysGoal.level}`} />
            </div>
          </section>
        )}

        {/* Everything else you're working toward, at a glance */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block' }}>
            Up Next
          </span>

          <GoalCard Icon={FaList} title="Season Journey" onClick={() => setScreen('seasonJourney')}>
            {nextJourneyTask ? (
              <>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{nextJourneyTask.chapter}</span>
                <span style={{ fontSize: 15, fontWeight: '700', color: 'var(--text)' }}>{nextJourneyTask.title}</span>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{nextJourneyTask.goal}</span>
              </>
            ) : (
              <span style={{ fontSize: 13, color: 'var(--gold-bright)' }}>All Season Journey tasks complete!</span>
            )}
          </GoalCard>

          <GoalCard Icon={FaFire} title="Altar of Rites" onClick={() => setScreen('alterRites')}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Next Seal ({unlockedSealCount}/{altarSealCostSequence.length}):{' '}
                </span>
                <span style={{ fontSize: 13, fontWeight: '600', color: nextSealCost ? 'var(--text)' : 'var(--gold-bright)' }}>
                  {nextSealCost ? nextSealCost.join(', ') : 'All Seals unlocked'}
                </span>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Next Potion ({unlockedPotionCount}/{altarPotionCostSequence.length}):{' '}
                </span>
                <span style={{ fontSize: 13, fontWeight: '600', color: nextPotionCost ? 'var(--text)' : 'var(--gold-bright)' }}>
                  {nextPotionCost ?? 'All Potion Powers unlocked'}
                </span>
              </div>
            </div>
          </GoalCard>
        </section>

      </div>
    </div>
  );
};

export default Welcome;
