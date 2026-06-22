import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import {
  FaHome, FaList, FaCalculator, FaChartBar, FaTrophy,
  FaFire, FaShieldAlt, FaGift, FaChevronRight,
} from 'react-icons/fa';
import { selectReduxSlice } from '../store/store';

const navItems = [
  { screen: 'paragonCalc',    label: 'Paragon Calculator', Icon: FaCalculator },
  { screen: 'seasonJourney',  label: 'Season Journey',     Icon: FaList },
  { screen: 'paragonTracker', label: 'Paragon Tracker',    Icon: FaChartBar },
  { screen: 'conquests',      label: 'Conquests',          Icon: FaTrophy },
  { screen: 'alterRites',     label: 'Altar of Rites',     Icon: FaFire },
  { screen: 'gearTracker',    label: 'Gear Tracker',       Icon: FaShieldAlt },
  { screen: 'haedrigsGift',   label: "Haedrig's Gift",     Icon: FaGift },
];

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

const NavCard = ({ screen: s, label, Icon, setScreen }) => (
  <button
    onClick={() => setScreen(s)}
    style={{
      width: '100%',
      height: 52,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      paddingLeft: 16,
      paddingRight: 14,
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderLeft: '3px solid var(--red-dim)',
      borderRadius: 'var(--r-md)',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'background-color 0.15s ease, border-left-color 0.15s ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
      e.currentTarget.style.borderLeftColor = 'var(--red-bright)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
      e.currentTarget.style.borderLeftColor = 'var(--red-dim)';
    }}
  >
    <Icon size={16} style={{ color: 'var(--red-bright)', flexShrink: 0 }} />
    <span style={{ flex: 1, fontSize: 14, fontWeight: '500', color: 'var(--text)' }}>{label}</span>
    <FaChevronRight size={11} style={{ color: 'var(--text-muted)' }} />
  </button>
);

const Welcome = ({ setScreen }) => {
  const Today      = DateTime.now().toLocaleString({ month: 'short', day: 'numeric' });
  const TodayLong  = DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const reduxState     = useSelector(selectReduxSlice);
  const reduxStateRef  = useRef(reduxState);
  reduxStateRef.current = reduxState;

  const [todaysGoal, setTodaysGoal] = useState(undefined);

  useEffect(() => {
    const next = reduxStateRef.current.playQueue?.[0];
    setTodaysGoal(next ?? undefined);
  }, [reduxState.playQueue]);

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

        {/* Navigation */}
        <section>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
            Navigate
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {navItems.map((item) => (
              <NavCard key={item.screen} setScreen={setScreen} {...item} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

export default Welcome;
