import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCheck, FaSkull } from 'react-icons/fa';
import conquestData from '../data/conquestData';
import { selectReduxSlice, setConquestProgress } from '../store/store';

const Conquests = () => {
  const dispatch      = useDispatch();
  const reduxState    = useSelector(selectReduxSlice);
  const reduxStateRef = useRef(reduxState);
  reduxStateRef.current = reduxState;

  const [showShort, setShowShort] = useState(true);

  const activeConquests = conquestData.filter((d) => d.active);

  // Build a completion map from Redux state, falling back to the data file's
  // defaults for any conquest not yet touched (handles fresh installs and new
  // seasons where conquestProgress starts empty).
  const completedMap = Object.fromEntries(
    activeConquests.map((d) => [
      d.key,
      reduxState.conquestProgress?.[d.key] ?? { sc: d.completed, hc: d.completedHardcore },
    ])
  );

  const toggle = (key, field) => {
    const state = reduxStateRef.current;
    const current = state.conquestProgress?.[key] ?? { sc: false, hc: false };
    const updated = { ...state.conquestProgress, [key]: { ...current, [field]: !current[field] } };
    dispatch(setConquestProgress(updated, state));
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)' }}>

      {/* Toggle button — sticky at top */}
      <div style={{
        flexShrink: 0,
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}>
        <button
          onClick={() => setShowShort(!showShort)}
          style={{
            padding: '6px 14px',
            borderRadius: 'var(--r-sm)',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--text-dim)',
            fontSize: 12,
            fontWeight: '500',
            letterSpacing: '0.04em',
          }}
        >
          {showShort ? 'Show Full Description' : 'Show Short Description'}
        </button>
      </div>

      {/* Conquest list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}>
        {activeConquests.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', padding: '16px 0' }}>
            No active conquests set for this season.
          </p>
        )}
        {activeConquests.map((d) => {
          const scDone = completedMap[d.key].sc;
          const hcDone = completedMap[d.key].hc;

          return (
            <div
              key={d.key}
              style={{
                marginBottom: 10,
                borderRadius: 'var(--r-lg)',
                border: '1px solid',
                borderColor: scDone ? 'rgba(196,18,48,0.35)' : 'var(--border-subtle)',
                backgroundColor: scDone ? 'rgba(196,18,48,0.06)' : 'var(--bg-surface)',
                overflow: 'hidden',
              }}
            >
              {/* Title row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px 8px',
                borderBottom: '1px solid var(--border-subtle)',
              }}>
                <span style={{ fontSize: 15, fontWeight: '700', color: 'var(--text)', flex: 1 }}>
                  {d.title}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FaSkull size={11} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.hardcore}</span>
                </div>
              </div>

              {/* Description */}
              <div style={{ padding: '8px 16px 12px' }}>
                <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 12 }}>
                  {showShort ? d.short : d.conquest}
                </p>

                {/* Completion toggles */}
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { label: 'Completed',    done: scDone, field: 'sc' },
                    { label: 'Completed HC', done: hcDone, field: 'hc' },
                  ].map(({ label, done, field }) => (
                    <button
                      key={field}
                      onClick={() => toggle(d.key, field)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '5px 12px',
                        borderRadius: 'var(--r-sm)',
                        border: '1px solid',
                        borderColor: done ? 'var(--red-bright)' : 'var(--border-subtle)',
                        backgroundColor: done ? 'var(--red-glow)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                        border: '1px solid',
                        borderColor: done ? 'var(--red-bright)' : 'var(--border-subtle)',
                        backgroundColor: done ? 'var(--red)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {done && <FaCheck size={8} style={{ color: 'white' }} />}
                      </div>
                      <span style={{ fontSize: 12, color: done ? 'var(--text)' : 'var(--text-dim)', fontWeight: done ? '600' : '400' }}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Conquests;
