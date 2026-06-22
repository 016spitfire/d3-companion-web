import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCurrentParagon,
  setSeasonalParagon,
  selectReduxSlice,
  setTotalParagons,
} from '../store/store';
import { getNumber, getBigInt } from '../utils/nonUIFuncs';
import paragonExpData from '../data/paragonExpData';

const formatXP = (xpBigInt) => {
  const n = Number(xpBigInt);
  if (n >= 1e15) return `${(n / 1e15).toFixed(2)}Q`;
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6)  return `${(n / 1e6).toFixed(2)}M`;
  return n.toLocaleString();
};

const getMilestoneData = (resultLevel) => {
  const level = getNumber(resultLevel);
  if (!level || level <= 0) return null;

  const nextMilestone = Math.ceil((level + 1) / 100) * 100;
  const prevMilestone = nextMilestone - 100;

  const currentEntry = paragonExpData.find((p) => getNumber(p.level) === level);
  const nextEntry    = paragonExpData.find((p) => getNumber(p.level) === nextMilestone);
  const prevEntry    = prevMilestone > 0
    ? paragonExpData.find((p) => getNumber(p.level) === prevMilestone)
    : null;

  if (!currentEntry || !nextEntry) return null;

  const currentXP = getBigInt(currentEntry.totalExp);
  const nextXP    = getBigInt(nextEntry.totalExp);
  const prevXP    = prevEntry ? getBigInt(prevEntry.totalExp) : 0n;

  const progressXP = currentXP - prevXP;
  const rangeXP    = nextXP - prevXP;
  const pct        = Number((progressXP * 100n) / rangeXP);
  const xpNeeded   = nextXP - currentXP;
  const totalXP    = currentXP;

  return { nextMilestone, prevMilestone, pct, xpNeeded, totalXP };
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  backgroundColor: 'var(--bg-raised)',
  border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--r-md)',
  color: 'var(--text)',
  fontSize: 22,
  fontWeight: '700',
  textAlign: 'center',
  outline: 'none',
};

const Stat = ({ label, value }) => (
  <div style={{
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    padding: '12px 14px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--r-md)',
  }}>
    <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
      {label}
    </span>
    <span style={{ fontSize: 18, fontWeight: '700', color: 'var(--gold-bright)' }}>
      {value}
    </span>
  </div>
);

const ParagonCalculator = () => {
  const dispatch       = useDispatch();
  const reduxState     = useSelector(selectReduxSlice);
  const reduxStateRef  = useRef(reduxState);
  const [calculating, setCalculating] = useState(false);
  reduxStateRef.current = reduxState;

  const result    = getNumber(reduxState.totalParagons);
  const milestone = result > 0 ? getMilestoneData(reduxState.totalParagons) : null;

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
    const currentExp  = paragonExpData.find((p) => getNumber(p.level) === Number(state.currentParagons));
    const seasonalExp = paragonExpData.find((p) => getNumber(p.level) === Number(state.seasonParagon));
    if (!currentExp || !seasonalExp) { setCalculating(false); return; }

    const highestPara = state.currentParagons > state.seasonParagon
      ? state.currentParagons : state.seasonParagon;
    const totalExp = getBigInt(currentExp.totalExp) + getBigInt(seasonalExp.totalExp);

    for (let i = highestPara; i < paragonExpData.length; i++) {
      const paragon     = paragonExpData.find((p) => getNumber(p.level) === i);
      const nextParagon = paragonExpData.find((p) => getNumber(p.level) === i + 1);
      if (
        nextParagon !== undefined &&
        getBigInt(nextParagon.totalExp) > totalExp &&
        getBigInt(paragon.totalExp) <= totalExp
      ) {
        dispatch(setTotalParagons(paragon.level, state));
        setCalculating(false);
        return;
      }
    }
    setCalculating(false);
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      overflowY: 'auto',
      backgroundColor: 'var(--bg-base)',
      display: 'flex',
      justifyContent: 'center',
      padding: '32px 24px 48px',
    }}>
      <div style={{ width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Heading */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: '700', color: 'var(--text)', letterSpacing: '0.04em' }}>
            Paragon Calculator
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            Combine your non-season and season paragons into a single total.
          </p>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', gap: 14 }}>
          {[
            { label: 'Non-Season', value: reduxState.currentParagons,
              onChange: (v) => dispatch(setCurrentParagon(Number(v) || 0, reduxStateRef.current)) },
            { label: 'Season',     value: reduxState.seasonParagon,
              onChange: (v) => dispatch(setSeasonalParagon(Number(v) || 0, reduxStateRef.current)) },
          ].map(({ label, value, onChange }) => (
            <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {label}
              </span>
              <input
                type="number"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        {/* Button */}
        <button
          onClick={() => { setCalculating(true); getTotalParagons(); }}
          style={{
            width: '100%', height: 50,
            background: 'linear-gradient(to right, var(--red), #8b0000)',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--red-dim)',
            color: 'white', fontSize: 15, fontWeight: '700',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(196,18,48,0.35)',
          }}
        >
          {calculating ? 'Calculating…' : 'Calculate'}
        </button>

        {/* Results */}
        {result > 0 && milestone && (
          <>
            {/* Combined level */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '24px 0 20px',
              borderTop: '1px solid var(--border-subtle)',
              borderBottom: '1px solid var(--border-subtle)',
              gap: 4,
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Combined Paragon
              </span>
              <span style={{ fontSize: 64, fontWeight: '700', color: 'var(--gold-bright)', lineHeight: 1 }}>
                {result.toLocaleString()}
              </span>
            </div>

            {/* Stat row */}
            <div style={{ display: 'flex', gap: 10 }}>
              <Stat label="Total XP"        value={formatXP(milestone.totalXP)} />
              <Stat label="Next Milestone"  value={`P${milestone.nextMilestone.toLocaleString()}`} />
              <Stat label="XP Remaining"    value={formatXP(milestone.xpNeeded)} />
            </div>

            {/* Progress bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                  P{milestone.prevMilestone.toLocaleString()} → P{milestone.nextMilestone.toLocaleString()}
                </span>
                <span style={{ fontSize: 12, fontWeight: '700', color: 'var(--text-dim)' }}>
                  {milestone.pct}%
                </span>
              </div>
              <div style={{
                width: '100%', height: 6,
                backgroundColor: 'var(--bg-raised)',
                borderRadius: 3, overflow: 'hidden',
              }}>
                <div style={{
                  width: `${milestone.pct}%`, height: '100%',
                  background: 'linear-gradient(to right, var(--red), var(--red-bright))',
                  borderRadius: 3,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          </>
        )}

        {/* Disclaimer */}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
          Accurate up to a combined result of paragon 10,000.
          If you need this disclaimer, you don&apos;t need this calculator.
        </span>

      </div>
    </div>
  );
};

export default ParagonCalculator;
