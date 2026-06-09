import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import { selectReduxSlice } from '../store/store';

const NavButton = ({ screen, title, setScreen }) => (
  <button
    onClick={() => setScreen(screen)}
    style={{
      width: '100%',
      height: 55,
      marginBottom: 15,
      borderRadius: 5,
      background: 'linear-gradient(135deg, rgba(0,83,164,1), rgba(31,28,109,1))',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      border: 'none',
    }}
  >
    <span style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>{title}</span>
  </button>
);

const buttons = [
  { screen: 'paragonCalc', title: 'Paragon Calculator' },
  { screen: 'seasonJourney', title: 'Season Journey' },
  { screen: 'alterRites', title: 'Altar of Rites' },
  { screen: 'gearTracker', title: 'Gear Tracker' },
  { screen: 'paragonTracker', title: 'Paragon Tracker' },
  { screen: 'conquests', title: 'Conquests' },
  { screen: 'haedrigsGift', title: "Haedrig's Gift" },
];

const Welcome = ({ setScreen }) => {
  const TodayLong = DateTime.now().toLocaleString({
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    weekday: 'long',
  });
  const Today = DateTime.now().toLocaleString({ month: 'short', day: 'numeric' });

  const reduxState = useSelector(selectReduxSlice);
  const reduxStateRef = useRef(reduxState);
  reduxStateRef.current = reduxState;

  const [todaysGoal, setTodaysGoal] = useState(undefined);

  useEffect(() => {
    if (reduxStateRef.current.goalData.length > 0) {
      const goal = reduxStateRef.current.goalData.find((d) => d.date === Today);
      if (goal !== undefined) setTodaysGoal(goal);
    }
  }, [reduxState.goalData]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(92,132,132,1), rgba(16,46,56,1))',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          width: '100%',
          height: 35,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{TodayLong}</span>
      </div>

      {todaysGoal !== undefined && (
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            paddingTop: 10,
            paddingBottom: 5,
          }}
        >
          {[
            { label: 'Non Season', value: reduxStateRef.current.currentParagons },
            { label: 'Current Season', value: reduxStateRef.current.seasonParagon },
            { label: 'Paragon Goal', value: todaysGoal.level },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>{label}:</span>
              <span style={{ color: 'white', fontSize: 36, fontWeight: 'bold', lineHeight: 1 }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ width: '90%', paddingTop: 15 }}>
        {buttons.map((button) => (
          <NavButton key={button.screen} setScreen={setScreen} {...button} />
        ))}
      </div>
    </div>
  );
};

export default Welcome;
