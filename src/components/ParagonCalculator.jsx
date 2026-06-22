import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCurrentParagon,
  setSeasonalParagon,
  selectReduxSlice,
  setTotalParagons,
  setGoalMode,
  setGoalTarget,
  setGoalFromCalculator,
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

// paragonExpData is contiguous and 1-indexed by level (array[0] is level 1), so a
// level lookup is direct array access rather than a linear .find() scan.
const getExpAtLevel = (level) => {
  const lvl = getNumber(level);
  if (!lvl || lvl <= 0) return 0n;
  const entry = paragonExpData[lvl - 1];
  return entry ? getBigInt(entry.totalExp) : null;
};

// Binary search for the lowest paragon level whose total XP meets the given amount.
// totalExp is monotonically increasing with level, so this is safe and avoids the
// O(n^2) cost of repeated .find() scans across a 10,000-entry table.
const getLevelForExp = (expBigInt) => {
  if (expBigInt <= 0n) return 0;
  let lo = 0, hi = paragonExpData.length - 1, answer = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const midXP = getBigInt(paragonExpData[mid].totalExp);
    if (midXP >= expBigInt) {
      answer = getNumber(paragonExpData[mid].level);
      hi = mid - 1;
    } else {
      lo = mid + 1;
    }
  }
  return answer; // null if expBigInt exceeds the table's max level
};

// Resolves a goal (direct season target, or a post-season combined target that gets
// back-solved against the entered non-season paragon) down to a single required
// season paragon, plus how far along the entered season paragon already is toward it.
const getGoalResolution = ({ goalMode, goalTarget, currentParagons, seasonParagon }) => {
  const targetLevel = getNumber(goalTarget);
  if (!targetLevel || targetLevel <= 0) return null;

  let requiredLevel;
  if (goalMode === 'combined') {
    const targetXP = getExpAtLevel(targetLevel);
    if (targetXP === null) return { outOfRange: true };
    const currentNonSeasonXP = getExpAtLevel(currentParagons) ?? 0n;
    const requiredSeasonXP = targetXP - currentNonSeasonXP;
    requiredLevel = requiredSeasonXP <= 0n ? 0 : getLevelForExp(requiredSeasonXP);
    if (requiredLevel === null) return { outOfRange: true };
  } else {
    requiredLevel = targetLevel;
  }

  const requiredXP     = getExpAtLevel(requiredLevel) ?? 0n;
  const currentSeasonXP = getExpAtLevel(seasonParagon) ?? 0n;

  let pct, remainingXP;
  if (requiredXP <= 0n) {
    pct = 100;
    remainingXP = 0n;
  } else {
    pct = Math.min(100, Math.max(0, Number((currentSeasonXP * 100n) / requiredXP)));
    remainingXP = requiredXP > currentSeasonXP ? requiredXP - currentSeasonXP : 0n;
  }

  return { requiredLevel, requiredXP, currentSeasonXP, pct, remainingXP, outOfRange: false };
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

const ParagonCalculator = ({ setScreen }) => {
  const dispatch       = useDispatch();
  const reduxState     = useSelector(selectReduxSlice);
  const reduxStateRef  = useRef(reduxState);
  const [calculating, setCalculating] = useState(false);
  reduxStateRef.current = reduxState;

  const result = getNumber(reduxState.totalParagons);

  const goalResolution = getGoalResolution({
    goalMode:        reduxState.goalMode,
    goalTarget:      reduxState.goalTarget,
    currentParagons: reduxState.currentParagons,
    seasonParagon:   reduxState.seasonParagon,
  });

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

  const planInTracker = () => {
    if (!goalResolution || goalResolution.outOfRange) return;
    dispatch(setGoalFromCalculator(goalResolution.requiredLevel, reduxStateRef.current));
    if (setScreen) setScreen('paragonTracker');
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

        {/* Combined total */}
        {result > 0 && (
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
        )}

        {/* Goal section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 4 }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: '700', color: 'var(--text)', letterSpacing: '0.04em' }}>
              Season Goal
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              Set what you're aiming for, and we'll work out the season paragon you need.
            </p>
          </div>

          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { mode: 'season',   label: 'Season Goal' },
              { mode: 'combined', label: 'Combined Goal' },
            ].map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => dispatch(setGoalMode(mode, reduxStateRef.current))}
                style={{
                  flex: 1, height: 38,
                  backgroundColor: reduxState.goalMode === mode ? 'var(--red-glow)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: reduxState.goalMode === mode ? 'var(--red-dim)' : 'var(--border-subtle)',
                  borderRadius: 'var(--r-sm)',
                  color: reduxState.goalMode === mode ? 'var(--red-bright)' : 'var(--text-dim)',
                  fontSize: 12, fontWeight: '700', letterSpacing: '0.04em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Target input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {reduxState.goalMode === 'combined' ? 'Target Combined Paragon' : 'Target Season Paragon'}
            </span>
            <input
              type="number"
              value={reduxState.goalTarget || ''}
              onChange={(e) => dispatch(setGoalTarget(Number(e.target.value) || 0, reduxStateRef.current))}
              style={inputStyle}
            />
          </div>

          {/* Resolved goal */}
          {goalResolution && !goalResolution.outOfRange && (
            <>
              <div style={{ display: 'flex', gap: 10 }}>
                <Stat label="Season Paragon Needed" value={goalResolution.requiredLevel.toLocaleString()} />
                <Stat label="XP Remaining"          value={formatXP(goalResolution.remainingXP)} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                    Progress toward P{goalResolution.requiredLevel.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: '700', color: 'var(--text-dim)' }}>
                    {goalResolution.pct}%
                  </span>
                </div>
                <div style={{
                  width: '100%', height: 6,
                  backgroundColor: 'var(--bg-raised)',
                  borderRadius: 3, overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${goalResolution.pct}%`, height: '100%',
                    background: 'linear-gradient(to right, var(--red), var(--red-bright))',
                    borderRadius: 3,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
              </div>

              <button
                onClick={planInTracker}
                style={{
                  width: '100%', height: 46,
                  background: 'linear-gradient(to right, var(--gold), var(--gold-bright))',
                  border: '1px solid var(--gold)',
                  borderRadius: 'var(--r-md)',
                  color: '#1a0005', fontSize: 13, fontWeight: '700',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                Plan This in Tracker →
              </button>
            </>
          )}

          {goalResolution?.outOfRange && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              That goal is beyond what this calculator can track (max paragon 10,000).
            </span>
          )}
        </div>

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
