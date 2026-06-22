import { useState } from 'react';
import { FaHome, FaList, FaCalculator, FaChartBar, FaTrophy, FaEllipsisH } from 'react-icons/fa';

const mainItems = [
  { screen: 'home',           label: 'Home',      Icon: FaHome },
  { screen: 'seasonJourney',  label: 'Season',    Icon: FaList },
  { screen: 'paragonCalc',    label: 'Paragon',   Icon: FaCalculator },
  { screen: 'paragonTracker', label: 'Tracker',   Icon: FaChartBar },
  { screen: 'conquests',      label: 'Conquests', Icon: FaTrophy },
];

const moreItems = [
  { screen: 'alterRites',   label: 'Altar of Rites' },
  { screen: 'gearTracker',  label: 'Gear Tracker' },
  { screen: 'haedrigsGift', label: "Haedrig's Gift" },
];

const BottomNav = ({ screen, setScreen }) => {
  const [showMore, setShowMore] = useState(false);

  const navigate = (s) => {
    setScreen(s);
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
              <button
                key={item.screen}
                onClick={() => navigate(item.screen)}
                style={{
                  width: '100%',
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 24,
                  backgroundColor: screen === item.screen ? 'var(--red-glow)' : 'transparent',
                  borderLeft: screen === item.screen ? '3px solid var(--red-bright)' : '3px solid transparent',
                  color: screen === item.screen ? 'var(--text)' : 'var(--text-dim)',
                  fontSize: 15,
                  fontWeight: screen === item.screen ? '700' : '400',
                  letterSpacing: '0.01em',
                }}
              >
                {item.label}
              </button>
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
        {mainItems.map(({ screen: s, label, Icon }) => {
          const active = screen === s;
          return (
            <button
              key={s}
              onClick={() => navigate(s)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 3,
                borderTop: active ? '2px solid var(--red-bright)' : '2px solid transparent',
                color: active ? 'var(--red-bright)' : 'var(--text-muted)',
              }}
            >
              <Icon size={18} />
              <span style={{
                fontSize: 10,
                fontWeight: active ? '700' : '400',
                letterSpacing: '0.03em',
              }}>
                {label}
              </span>
            </button>
          );
        })}

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
