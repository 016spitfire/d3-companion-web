import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCurrentParagon,
  setSeasonalParagon,
  selectReduxSlice,
  setTotalParagons,
} from '../store/store';
import { getNumber } from '../utils/nonUIFuncs';
import paragonExpData from '../data/paragonExpData';

const ParagonCalculator = () => {
  const dispatch = useDispatch();
  const reduxState = useSelector(selectReduxSlice);
  const reduxStateRef = useRef(reduxState);
  const [calculating, setCalculating] = useState(false);
  reduxStateRef.current = reduxState;

  const getTotalParagons = () => {
    const state = reduxStateRef.current;
    if (state.currentParagons === 0) {
      dispatch(setTotalParagons(state.seasonParagon, state));
      setCalculating(false);
      return;
    }
    if (state.seasonParagon === 0) {
      dispatch(setTotalParagons(state.currentParagons, state));
      setCalculating(false);
      return;
    }

    const currentExp = paragonExpData.find((p) => getNumber(p.level) === Number(state.currentParagons));
    const seasonalExp = paragonExpData.find((p) => getNumber(p.level) === Number(state.seasonParagon));
    if (!currentExp || !seasonalExp) { setCalculating(false); return; }

    const highestPara = state.currentParagons > state.seasonParagon
      ? state.currentParagons
      : state.seasonParagon;
    const totalExp = getNumber(currentExp.totalExp) + getNumber(seasonalExp.totalExp);

    for (let i = highestPara; i < paragonExpData.length; i++) {
      const paragon = paragonExpData.find((p) => getNumber(p.level) === i);
      const nextParagon = paragonExpData.find((p) => getNumber(p.level) === i + 1);
      if (
        nextParagon !== undefined &&
        getNumber(nextParagon.totalExp) > totalExp &&
        getNumber(paragon.totalExp) <= totalExp
      ) {
        dispatch(setTotalParagons(paragon.level, state));
        setCalculating(false);
        return;
      }
    }
    setCalculating(false);
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '90%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: 15,
          borderRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly' }}>
          {[
            {
              label: 'Current',
              value: reduxState.currentParagons,
              onChange: (v) => dispatch(setCurrentParagon(Number(v) || 0, reduxStateRef.current)),
            },
            {
              label: 'Season',
              value: reduxState.seasonParagon,
              onChange: (v) => dispatch(setSeasonalParagon(Number(v) || 0, reduxStateRef.current)),
            },
          ].map(({ label, value, onChange }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>{label}</span>
              <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                  backgroundColor: 'white',
                  fontSize: 22,
                  height: 40,
                  paddingLeft: 10,
                  paddingRight: 10,
                  borderRadius: 10,
                  fontWeight: 'bold',
                  border: 'none',
                  width: 120,
                  textAlign: 'center',
                }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => {
              setCalculating(true);
              getTotalParagons();
            }}
            style={{
              width: '100%',
              height: 55,
              backgroundColor: 'green',
              borderRadius: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <span style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>Calculate!</span>
          </button>
          {calculating ? (
            <span style={{ color: 'white', fontSize: 20 }}>Calculating...</span>
          ) : (
            <span style={{ color: 'white', fontSize: 34, fontWeight: 'bold' }}>
              {reduxState.totalParagons}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParagonCalculator;
