const buttons = [
  { screen: 'home', title: 'Home' },
  { screen: 'paragonCalc', title: 'Paragon Calculator' },
  { screen: 'seasonJourney', title: 'Season Journey' },
  { screen: 'alterRites', title: 'Altar of Rites' },
  { screen: 'gearTracker', title: 'Gear Tracker' },
  { screen: 'paragonTracker', title: 'Paragon Tracker' },
  { screen: 'conquests', title: 'Conquests' },
  { screen: 'haedrigsGift', title: "Haedrig's Gift" },
];

const Menu = ({ setScreen, setShowMenu }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <div
        style={{
          width: 250,
          height: '100%',
          background: 'linear-gradient(135deg, rgba(100,100,100,1), rgba(0,0,0,1))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 10,
          flexShrink: 0,
        }}
      >
        {buttons.map((button) => (
          <button
            key={button.screen}
            onClick={() => {
              setScreen(button.screen);
              setShowMenu(false);
            }}
            style={{
              width: '95%',
              height: 35,
              marginBottom: 10,
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(180,45,35,1), rgba(109,28,31,1))',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
              {button.title}
            </span>
          </button>
        ))}
      </div>
      <div
        onClick={() => setShowMenu(false)}
        style={{
          flex: 1,
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          cursor: 'pointer',
        }}
      />
    </div>
  );
};

export default Menu;
