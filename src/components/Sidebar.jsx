import { NavLink } from 'react-router-dom';
import {
  FaHome, FaList, FaCalculator, FaChartBar, FaTrophy,
  FaFire, FaShieldAlt, FaGift,
} from 'react-icons/fa';

const items = [
  { path: '/',          label: 'Home',               Icon: FaHome },
  { path: '/journey',   label: 'Season Journey',     Icon: FaList },
  { path: '/paragon',   label: 'Paragon Calculator', Icon: FaCalculator },
  { path: '/tracker',   label: 'Paragon Tracker',    Icon: FaChartBar },
  { path: '/conquests', label: 'Conquests',          Icon: FaTrophy },
  { path: '/altar',     label: 'Altar of Rites',     Icon: FaFire },
  { path: '/gear',      label: 'Gear Tracker',       Icon: FaShieldAlt },
  { path: '/haedrig',   label: "Haedrig's Gift",     Icon: FaGift },
];

const Sidebar = () => (
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
    {items.map(({ path, label, Icon }) => (
      <NavLink
        key={path}
        to={path}
        end={path === '/'}
        style={({ isActive }) => ({
          width: '100%',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: isActive ? 15 : 18,
          gap: 12,
          textDecoration: 'none',
          backgroundColor: isActive ? 'var(--red-glow)' : 'transparent',
          borderLeft: isActive ? '3px solid var(--red-bright)' : '3px solid transparent',
          color: isActive ? 'var(--text)' : 'var(--text-dim)',
          fontSize: 13,
          fontWeight: isActive ? '700' : '400',
          letterSpacing: isActive ? '0.02em' : '0',
          transition: 'all 0.15s ease',
        })}
      >
        {({ isActive }) => (
          <>
            <Icon
              size={14}
              style={{
                color: isActive ? 'var(--red-bright)' : 'var(--text-muted)',
                flexShrink: 0,
              }}
            />
            <span>{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

export default Sidebar;
