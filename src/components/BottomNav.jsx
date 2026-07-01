import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaList, FaCalculator, FaChartBar, FaTrophy, FaEllipsisH } from 'react-icons/fa';

const mainItems = [
  { path: '/',          label: 'Home',    Icon: FaHome },
  { path: '/journey',   label: 'Season',  Icon: FaList },
  { path: '/paragon',   label: 'Paragon', Icon: FaCalculator },
  { path: '/tracker',   label: 'Tracker', Icon: FaChartBar },
  { path: '/conquests', label: 'Conquests', Icon: FaTrophy },
];

const moreItems = [
  { path: '/altar',   label: 'Altar of Rites' },
  { path: '/haedrig', label: "Haedrig's Gift" },
];

const BottomNav = () => {
  const [showMore, setShowMore] = useState(false);
  const navigate = useNavigate();

  const goTo = (path) => {
    navigate(path);
    setShowMore(false);
  };

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {showMore && (
        <>
          <div
            onClick={() => setShowMore(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 5 }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              right: 0,
              zIndex: 6,
              backgroundColor: '#111113',
              borderTop: '1px solid var(--border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {moreItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setShowMore(false)}
                style={({ isActive }) => ({
                  width: '100%',
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 24,
                  textDecoration: 'none',
                  backgroundColor: isActive ? 'var(--red-glow)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--red-bright)' : '3px solid transparent',
                  color: isActive ? 'var(--text)' : 'var(--text-dim)',
                  fontSize: 15,
                  fontWeight: isActive ? '700' : '400',
                  letterSpacing: '0.01em',
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </>
      )}

      <nav
        style={{
          display: 'flex',
          flexDirection: 'row',
          height: 60,
          backgroundColor: '#0e0e10',
          borderTop: '1px solid var(--border)',
        }}
      >
        {mainItems.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            style={({ isActive }) => ({
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              borderTop: isActive ? '2px solid var(--red-bright)' : '2px solid transparent',
              color: isActive ? 'var(--red-bright)' : 'var(--text-muted)',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={18} />
                <span style={{
                  fontSize: 10,
                  fontWeight: isActive ? '700' : '400',
                  letterSpacing: '0.03em',
                }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        <button
          onClick={() => setShowMore(!showMore)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
            borderTop: showMore ? '2px solid var(--red-bright)' : '2px solid transparent',
            color: showMore ? 'var(--red-bright)' : 'var(--text-muted)',
          }}
        >
          <FaEllipsisH size={18} />
          <span style={{ fontSize: 10, fontWeight: showMore ? '700' : '400', letterSpacing: '0.03em' }}>
            More
          </span>
        </button>
      </nav>
    </div>
  );
};

export default BottomNav;
