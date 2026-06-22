import {
  FaHome, FaList, FaCalculator, FaChartBar, FaTrophy,
  FaFire, FaShieldAlt, FaGift,
} from 'react-icons/fa';

const items = [
  { screen: 'home',           label: 'Home',               Icon: FaHome },
  { screen: 'seasonJourney',  label: 'Season Journey',     Icon: FaList },
  { screen: 'paragonCalc',    label: 'Paragon Calculator', Icon: FaCalculator },
  { screen: 'paragonTracker', label: 'Paragon Tracker',    Icon: FaChartBar },
  { screen: 'conquests',      label: 'Conquests',          Icon: FaTrophy },
  { screen: 'alterRites',     label: 'Altar of Rites',     Icon: FaFire },
  { screen: 'gearTracker',    label: 'Gear Tracker',       Icon: FaShieldAlt },
  { screen: 'haedrigsGift',   label: "Haedrig's Gift",     Icon: FaGift },
];

const Sidebar = ({ screen, setScreen }) => (
  <nav
    style={{
      width: 220,
      flexShrink: 0,
      height: '100%',
      backgroundColor: '#0e0e10',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 12,
      overflowY: 'auto',
    }}
  >
    {items.map(({ screen: s, label, Icon }) => {
      const active = screen === s;
      return (
        <button
          key={s}
          onClick={() => setScreen(s)}
          style={{
            width: '100%',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: active ? 15 : 18,
            gap: 12,
            cursor: 'pointer',
            backgroundColor: active ? 'var(--red-glow)' : 'transparent',
            borderLeft: active ? '3px solid var(--red-bright)' : '3px solid transparent',
            borderRight: 'none',
            borderTop: 'none',
            borderBottom: 'none',
            color: active ? 'var(--text)' : 'var(--text-dim)',
            fontSize: 13,
            fontWeight: active ? '700' : '400',
            letterSpacing: active ? '0.02em' : '0',
            textAlign: 'left',
            transition: 'all 0.15s ease',
          }}
        >
          <Icon
            size={14}
            style={{
              color: active ? 'var(--red-bright)' : 'var(--text-muted)',
              flexShrink: 0,
            }}
          />
          <span>{label}</span>
        </button>
      );
    })}
  </nav>
);

export default Sidebar;
