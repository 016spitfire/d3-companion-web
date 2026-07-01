import { useState, useRef, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DateTime, Interval } from 'luxon';
import { FaCalendarAlt, FaCompress, FaExpand } from 'react-icons/fa';
import { getNumber, getParagonFromExp } from '../utils/nonUIFuncs';
import {
  selectReduxSlice,
  setGoalParagons,
  setWeeks,
  setDaysPerWeek,
  setGoalData,
  setMilestoneCount,
  setTrackerMethod,
  setNewStartDate,
} from '../store/store';
import paragonExpData from '../data/paragonExpData';
import Calendar from './components/Calendar';

// Shared calculation: given total XP to goal and a count of checkpoints,
// returns a goalData array. Pass dates array to fill in the date field (daily
// method), or omit it for the milestone method.
const buildGoalData = ({ goalExp, count, dates }) => {
  const chunkExp  = goalExp / count;
  const entries   = [];
  let highestP    = 0;
  let lastLevel   = 0;
  for (let i = 1; i <= count; i++) {
    const exp    = Math.ceil(chunkExp * i);
    const paragon = getParagonFromExp({ highestParagon: highestP, exp, data: paragonExpData });
    if (!paragon) break;
    highestP = getNumber(paragon.level);
    entries.push({
      key:        i,
      level:      getNumber(paragon.level),
      difference: getNumber(paragon.level) - lastLevel,
      completed:  false,
      date:       dates ? (dates[i - 1] ?? null) : null,
    });
    lastLevel = getNumber(paragon.level);
  }
  return entries;
};

const ParagonTracker = () => {
  const dispatch      = useDispatch();
  const reduxState    = useSelector(selectReduxSlice);
  const reduxStateRef = useRef(reduxState);
  reduxStateRef.current = reduxState;

  const [showCalendar, setShowCalendar] = useState(false);
  const [dense,        setDense]        = useState(false);

  const method = reduxState.trackerMethod ?? 'milestone';

  useLayoutEffect(() => {
    if (method === 'daily' && !reduxStateRef.current.startDate) setShowCalendar(true);
  }, [method]);

  // ---- calculate handlers ----

  const calcMilestones = () => {
    const state = reduxStateRef.current;
    const goalEntry = paragonExpData.find((d) => getNumber(d.level) === Number(state.goalParagons));
    if (!goalEntry || !state.milestoneCount) return;
    const entries = buildGoalData({ goalExp: getNumber(goalEntry.totalExp), count: state.milestoneCount });
    dispatch(setGoalData(entries, state));
  };

  const calcDaily = () => {
    const state = reduxStateRef.current;
    const goalEntry = paragonExpData.find((d) => getNumber(d.level) === Number(state.goalParagons));
    if (!goalEntry || !state.weeks || !state.daysPerWeek || !state.startDate) return;
    const days  = state.weeks * state.daysPerWeek;
    const start = DateTime.fromFormat(`${state.startDate} ${new Date().getFullYear()}`, 'MMM d yyyy');
    const end   = start.plus({ days: state.weeks * 7 - 1 });
    const allDates = Interval.fromDateTimes(start.startOf('day'), end.endOf('day'))
      .splitBy({ day: 1 })
      .map((d) => d.start.toLocaleString({ month: 'short', day: 'numeric' }));
    const playDates = allDates.filter((_, i) => i % Math.ceil(7 / state.daysPerWeek) < state.daysPerWeek).slice(0, days);
    const entries = buildGoalData({ goalExp: getNumber(goalEntry.totalExp), count: days, dates: playDates });
    dispatch(setGoalData(entries, state));
  };

  const handleDateSelect = (data) => {
    dispatch(setNewStartDate(`${data.monthShort} ${data.date}`, reduxStateRef.current));
    setShowCalendar(false);
  };

  // ---- mark complete ----

  const setCompleted = (entry) => {
    const state = reduxStateRef.current;
    const newGoalData = state.goalData.map((d) => {
      if (entry.completed && d.key === entry.key) return { ...d, completed: false };
      return { ...d, completed: d.key <= entry.key };
    });
    dispatch(setGoalData(newGoalData, state));
  };

  // ---- derived ----

  const { goalData } = reduxState;
  const hasPlan      = goalData.length > 0;
  const completedCount = goalData.filter((d) => d.completed).length;
  const pct = hasPlan ? Math.round((completedCount / goalData.length) * 100) : 0;

  const canCalcMilestone = reduxState.goalParagons > 0 && (reduxState.milestoneCount ?? 0) > 0;
  const canCalcDaily     = reduxState.goalParagons > 0 && reduxState.weeks > 0
    && reduxState.daysPerWeek > 0 && !!reduxState.startDate;

  const weekGroups = (() => {
    if (!hasPlan) return [];
    const groups = [];
    for (let i = 0; i < goalData.length; i += 7) {
      groups.push(goalData.slice(i, i + 7));
    }
    return groups;
  })();

  const switchMethod = (m) => {
    dispatch(setTrackerMethod(m, reduxStateRef.current));
    if (m === 'daily' && !reduxStateRef.current.startDate) setShowCalendar(true);
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      backgroundColor: 'var(--bg-base)',
      overflow: 'hidden', position: 'relative',
    }}>

      {/* Calendar overlay (daily method only) */}
      {showCalendar && (
        <div
          onClick={() => reduxState.startDate && setShowCalendar(false)}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.88)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 14, padding: 24,
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Choose Start Date
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <Calendar pressFunc={handleDateSelect} chosenDate={reduxState.startDate} />
          </div>
          {reduxState.startDate && (
            <button
              onClick={() => setShowCalendar(false)}
              style={{
                padding: '8px 24px',
                backgroundColor: 'var(--bg-raised)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--r-md)',
                color: 'var(--text-dim)', fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Config header */}
      <div style={{
        flexShrink: 0,
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: '#161618',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>

        {/* Method toggle */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { key: 'milestone', label: 'Milestones' },
            { key: 'daily',     label: 'Daily Goals' },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => switchMethod(m.key)}
              style={{
                flex: 1, height: 32,
                backgroundColor: method === m.key ? 'var(--red-glow)' : 'transparent',
                border: '1px solid',
                borderColor: method === m.key ? 'var(--red-dim)' : 'var(--border-subtle)',
                borderRadius: 'var(--r-sm)',
                color: method === m.key ? 'var(--text)' : 'var(--text-muted)',
                fontSize: 12, fontWeight: method === m.key ? '700' : '400',
                cursor: 'pointer',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Inputs row */}
        {method === 'milestone' ? (
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Goal P',      value: reduxState.goalParagons,   action: setGoalParagons,   linked: reduxState.goalParagonsLinked },
              { label: 'Milestones',  value: reduxState.milestoneCount, action: setMilestoneCount },
            ].map(({ label, value, action, linked }) => (
              <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {label}
                  {linked && (
                    <span style={{
                      fontSize: 8, fontWeight: '700', letterSpacing: '0.02em', textTransform: 'none',
                      color: 'var(--gold-bright)', backgroundColor: 'rgba(224,168,48,0.12)',
                      border: '1px solid rgba(224,168,48,0.3)', borderRadius: 'var(--r-sm)',
                      padding: '1px 5px',
                    }}>
                      from Calculator
                    </span>
                  )}
                </span>
                <input
                  type="number"
                  value={value || ''}
                  onChange={(e) => dispatch(action(Number(e.target.value) || 0, reduxStateRef.current))}
                  style={{
                    width: '100%', padding: '7px 8px',
                    backgroundColor: 'var(--bg-base)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--r-sm)',
                    color: 'var(--text)', fontSize: 18, fontWeight: '700',
                    textAlign: 'center', outline: 'none',
                  }}
                />
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <button
                onClick={calcMilestones}
                disabled={!canCalcMilestone}
                style={{
                  height: 38, paddingLeft: 16, paddingRight: 16,
                  background: canCalcMilestone ? 'linear-gradient(to right, var(--red), #8b0000)' : 'var(--bg-raised)',
                  border: '1px solid',
                  borderColor: canCalcMilestone ? 'var(--red-dim)' : 'var(--border-subtle)',
                  borderRadius: 'var(--r-sm)',
                  color: canCalcMilestone ? 'white' : 'var(--text-muted)',
                  fontSize: 12, fontWeight: '700',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: canCalcMilestone ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
                }}
              >
                Calculate
              </button>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Goal P',  value: reduxState.goalParagons, action: setGoalParagons, linked: reduxState.goalParagonsLinked },
                { label: 'Weeks',   value: reduxState.weeks,         action: setWeeks },
                { label: 'Days/Wk', value: reduxState.daysPerWeek,  action: setDaysPerWeek },
              ].map(({ label, value, action, linked }) => (
                <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {label}
                    {linked && (
                      <span style={{
                        fontSize: 8, fontWeight: '700', letterSpacing: '0.02em', textTransform: 'none',
                        color: 'var(--gold-bright)', backgroundColor: 'rgba(224,168,48,0.12)',
                        border: '1px solid rgba(224,168,48,0.3)', borderRadius: 'var(--r-sm)',
                        padding: '1px 5px',
                      }}>
                        from Calculator
                      </span>
                    )}
                  </span>
                  <input
                    type="number"
                    value={value || ''}
                    onChange={(e) => dispatch(action(Number(e.target.value) || 0, reduxStateRef.current))}
                    style={{
                      width: '100%', padding: '7px 8px',
                      backgroundColor: 'var(--bg-base)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)',
                      color: 'var(--text)', fontSize: 18, fontWeight: '700',
                      textAlign: 'center', outline: 'none',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowCalendar(true)}
                style={{
                  flex: 1, height: 38,
                  display: 'flex', alignItems: 'center', gap: 9, paddingLeft: 12,
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-sm)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <FaCalendarAlt size={13} style={{ color: 'var(--red-bright)', flexShrink: 0 }} />
                <span style={{
                  fontSize: 13,
                  color: reduxState.startDate ? 'var(--text)' : 'var(--text-dim)',
                  fontWeight: reduxState.startDate ? '600' : '400',
                }}>
                  {reduxState.startDate ? `Starting ${reduxState.startDate}` : 'Pick start date'}
                </span>
              </button>
              <button
                onClick={calcDaily}
                disabled={!canCalcDaily}
                style={{
                  height: 38, paddingLeft: 16, paddingRight: 16,
                  background: canCalcDaily ? 'linear-gradient(to right, var(--red), #8b0000)' : 'var(--bg-raised)',
                  border: '1px solid',
                  borderColor: canCalcDaily ? 'var(--red-dim)' : 'var(--border-subtle)',
                  borderRadius: 'var(--r-sm)',
                  color: canCalcDaily ? 'white' : 'var(--text-muted)',
                  fontSize: 12, fontWeight: '700',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: canCalcDaily ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
                }}
              >
                Calculate
              </button>
            </div>
          </>
        )}

        {/* Progress bar */}
        {hasPlan && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                {completedCount} / {goalData.length} {method === 'milestone' ? 'milestones' : 'days'} complete
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: '700', color: 'var(--text-dim)' }}>{pct}%</span>
                <button
                  onClick={() => setDense(!dense)}
                  title={dense ? 'Comfortable view' : 'Compact view'}
                  style={{
                    width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: dense ? 'var(--red-glow)' : 'transparent',
                    border: '1px solid',
                    borderColor: dense ? 'var(--red-dim)' : 'var(--border-subtle)',
                    borderRadius: 'var(--r-sm)', cursor: 'pointer',
                  }}
                >
                  {dense
                    ? <FaExpand   size={9} style={{ color: 'var(--red-bright)' }} />
                    : <FaCompress size={9} style={{ color: 'var(--text-dim)' }} />}
                </button>
              </div>
            </div>
            <div style={{ width: '100%', height: 4, backgroundColor: 'var(--bg-raised)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: 'linear-gradient(to right, var(--red), var(--red-bright))',
                borderRadius: 2, transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Goal list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px' }}>
        {!hasPlan ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: 8,
          }}>
            <span style={{ fontSize: 14, color: 'var(--text-dim)', opacity: 0.6 }}>No plan yet.</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', opacity: 0.5, textAlign: 'center', maxWidth: 240 }}>
              {method === 'milestone'
                ? 'Set your goal and milestone count, then hit Calculate.'
                : 'Set your goal, weeks, days per week, pick a start date, then hit Calculate.'}
            </span>
          </div>
        ) : (
          <>
            {method === 'daily' && (
              <div style={{
                display: 'flex',
                backgroundColor: 'white',
                marginBottom: 4,
                padding: '2px 0',
                borderRadius: 'var(--r-sm)',
              }}>
                {[0, 1].map((i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '50%', padding: '0 8px' }}>
                    <span style={{ fontSize: 11, fontWeight: 'bold', color: '#333', width: 46 }}>Date</span>
                    <span style={{ fontSize: 11, flex: 1, color: '#333' }}>Paragon</span>
                    <span style={{ fontSize: 11, color: '#333' }}>Diff</span>
                  </div>
                ))}
              </div>
            )}

            {method === 'milestone' ? (
              // Milestone view: groups of 7 with week headers
              weekGroups.map((group, gi) => (
                <div key={gi} style={{ marginBottom: 20 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 6, paddingBottom: 5,
                    borderBottom: '1px solid var(--border-subtle)',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: '700', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                      {gi === 0 ? 'MILESTONES' : `MILESTONES ${gi * 7 + 1}–${Math.min((gi + 1) * 7, goalData.length)}`}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {group.filter((d) => d.completed).length}/{group.length} done
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {group.map((entry) => (
                      <button
                        key={entry.key}
                        onClick={() => setCompleted(entry)}
                        style={{
                          display: 'flex', alignItems: 'center',
                          gap: dense ? 8 : 10,
                          padding: dense ? '6px 10px' : '10px 12px',
                          borderRadius: 'var(--r-md)',
                          border: '1px solid',
                          borderColor: entry.completed ? 'rgba(150,255,150,0.25)' : 'var(--border-subtle)',
                          backgroundColor: entry.completed ? 'rgba(150,255,150,0.08)' : 'var(--bg-surface)',
                          cursor: 'pointer', textAlign: 'left',
                        }}
                      >
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 22, flexShrink: 0 }}>
                          #{entry.key}
                        </span>
                        <span style={{ flex: 1, fontSize: dense ? 13 : 16, fontWeight: '700', color: entry.completed ? 'rgba(150,255,150,0.8)' : 'var(--gold-bright)' }}>
                          P {entry.level.toLocaleString()}
                        </span>
                        <span style={{ fontSize: dense ? 11 : 12, color: 'var(--text-dim)', flexShrink: 0 }}>
                          +{entry.difference}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Daily view: flat 2-column list matching original layout
              <div style={{
                display: 'flex', flexDirection: 'row', flexWrap: 'wrap',
                justifyContent: 'space-between', alignContent: 'flex-start', gap: 2,
              }}>
                {goalData.map((entry) => (
                  <button
                    key={entry.key}
                    onClick={() => setCompleted(entry)}
                    style={{
                      display: 'flex', flexDirection: 'row',
                      justifyContent: 'space-between', alignItems: 'center',
                      width: 'calc(50% - 1px)',
                      height: dense ? 25 : 30,
                      borderRadius: 2,
                      backgroundColor: entry.completed ? 'rgba(150,255,150,1)' : 'rgba(215,215,255,0.7)',
                      border: 'none', cursor: 'pointer',
                      padding: '0 8px',
                    }}
                  >
                    <span style={{ fontWeight: 'bold', fontSize: 11, width: 50, textAlign: 'left', color: '#222' }}>
                      {entry.date ?? `#${entry.key}`}
                    </span>
                    <span style={{ flex: 1, fontSize: 11, textAlign: 'left', color: '#222' }}>
                      {entry.level.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 11, color: '#222' }}>+{entry.difference}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParagonTracker;
