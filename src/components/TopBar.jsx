import { FaBars } from 'react-icons/fa';

const TopBar = ({ topBarHeight, setShowMenu, showMenu }) => {
  return (
    <div
      style={{
        width: '100%',
        height: topBarHeight,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(to bottom, rgba(244,3,1,1), rgba(73,0,7,1))',
        borderBottom: '1px solid rgba(40,0,5,1)',
        flexShrink: 0,
      }}
    >
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          width: topBarHeight,
          height: topBarHeight,
          backgroundColor: 'rgba(0,0,0,0.4)',
          borderRight: '1px solid rgba(40,0,5,1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          border: 'none',
          flexShrink: 0,
        }}
      >
        <FaBars color="white" size={28} />
      </button>
      <span style={{ fontSize: 22, fontWeight: 'bold', color: 'white' }}>
        Diablo 3 Companion
      </span>
      <div style={{ width: topBarHeight }} />
    </div>
  );
};

export default TopBar;
