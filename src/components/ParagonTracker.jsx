import { useState, useRef, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DateTime } from 'luxon';
import { FaCalendarAlt, FaCompress, FaExpand, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { getNumber, getParagonFromExp } from '../utils/nonUIFuncs';
import {
  selectReduxSlice,
  setGoalParagons,
  setWeeks,
  setDaysPerWeek,
  setTrackerData,
  setNewStartDate,
} from '../store/store';
import paragonExpData from '../data/paragonExpData';
import Calendar from './components/Calendar';

const parseDate = (str) => {
  const year   = new Date().getFullYear();
  let parsed   = DateTime.fromFormat(`${str} ${year}`, 'MMM d yyyy');
  if (!parsed.isValid) return null;
  if (parsed.diff(DateTime.now(), 'months').months > 6) {
    parsed = DateTime.fromFormat(`${str} ${year - 1}`, 'MMM d yyyy');
  }
  return parsed;
};

const getNextClaimDate = (history, startDate) => {
  if (!startDate) return null;
  if (history.length === 0) return startDate;
  const parsed = parseDate(history[history.length - 1].date);
  if (!parsed) return startDate;
  return parsed.plus({ days: 1 }).toLocaleString({ month: 'short', day: 'numeric' });
};

const groupByWeek = (history) => {
  const weeks = [];
  for (let i = 0; i < history.length; i += 7) {
    const entries = history.slice(i, i + 7);
    weeks.push({
      weekNum:    Math.floor(i / 7) + 1,
      entries,
      start:      entries[0]?.date,
      end:        entries[entries.length - 1]?.date,
      startIndex: i,
    });
  }
  return weeks;
};

const ParagonTracker = () => {
  const dispatch      = useDispatch();
  const reduxState    = useSelector(selectReduxSlice);
  const reduxStateRef = useRef(reduxState);
  reduxStateRef.current = reduxState;

  const [showCalendar, setShowCalendar] = useState(false);
  const [dense,        setDense]        = useState(false);
  const [showInfo,     setShowInfo]     = useState(false);

  useLayoutEffect(() => {
    if (!reduxStateRef.current.startDate) setShowCalendar(true);
  }, []);

  const handleDateSelect = (data) => {
    dispatch(setNewStartDate(`${data.monthShort} ${data.date}`, reduxStateRef.current));
    setShowCalendar(false);
  };

  const getExpGoal = () => {
    const state = reduxStateRef.current;
    if (!state.goalParagons || !state.weeks || !state.daysPerWeek) return;
    const newGoal = paragonExpData.find((d) => getNumber(d.level) === Number(state.goalParagons));
    if (!newGoal) return;

    const totalPlayDays = state.weeks * state.daysPerWeek;
    const totalRestDays = state.weeks * (7 - state.daysPerWeek);
    const dailyGoal     = getNumber(newGoal.totalExp) / totalPlayDays;

    const playQueue    = [];
    let highestParagon = 0;
    let lastDayP       = 0;
    for (let i = 1; i <= totalPlayDays; i++) {
      const exp     = Math.ceil(dailyGoal * i);
      const paragon = getParagonFromExp({ highestParagon, exp, data: paragonExpData });
      if (!paragon) break;
      highestParagon = getNumber(paragon.level);
      playQueue.push({
        key:        i,
        level:      getNumber(paragon.level),
        difference: getNumber(paragon.level) - lastDayP,
        goal:       exp,
      });
      lastDayP = getNumber(paragon.level);
    }

    const restQueue = Array.from({ length: totalRestDays }, (_, i) => ({ key: i + 1 }));
    dispatch(setTrackerData({ playQueue, restQueue, history: [] }, state));
  };

  const claimDay = (type) => {
    const state    = reduxStateRef.current;
    const nextDate = getNextClaimDate(state.history, state.startDate);
    if (!nextDate) return;

    if (type === 'play') {
      if (state.playQueue.length === 0) return;
      const item = state.playQueue[0];
      dispatch(setTrackerData({
        playQueue: state.playQueue.slice(1),
        restQueue: state.restQueue,
        history:   [...state.history, { type: 'play', date: nextDate, level: item.level, difference: item.difference }],
      }, state));
    } else {
      if (state.restQueue.length === 0) return;
      dispatch(setTrackerData({
        playQueue: state.playQueue,
        restQueue: state.restQueue.slice(1),
        history:   [...state.history, { type: 'rest', date: nextDate }],
      }, state));
    }
  };

  const deleteEntry = (index) => {
    const state = reduxStateRef.current;
    if (!state.history[index]) return;

    // Everything from index onward unwinds back to the queues in order.
    // You can't have P 1,252 on record without P 846 — deleting a middle
    // entry invalidates everything that came after it.
    const toUnwind   = state.history.slice(index);
    const newHistory = state.history.slice(0, index);

    const playBack = toUnwind.filter(e => e.type === 'play')
      .map(e => ({ level: e.level, difference: e.difference, goal: 0 }));
    const restBack = toUnwind.filter(e => e.type === 'rest')
      .map(() => ({ key: 0 }));

    dispatch(setTrackerData({
      playQueue: [...playBack, ...state.playQueue],
      restQueue: [...restBack, ...state.restQueue],
      history:   newHistory,
    }, state));
  };

  const { playQueue, restQueue, history } = reduxState;
  const completedPlay = history.filter((d) => d.type === 'play').length;
  const totalPlay     = completedPlay + playQueue.length;
  const pct           = totalPlay > 0 ? Math.round((completedPlay / totalPlay) * 100) : 0;
  const isMobile      = reduxState.width < 500;
  const hasPlan       = playQueue.length > 0 || restQueue.length > 0 || history.length > 0;
  const canCalc       = reduxState.goalParagons > 0 && reduxState.weeks > 0
    && reduxState.daysPerWeek > 0 && !!reduxState.startDate;
  const nextDate      = getNextClaimDate(history, reduxState.startDate);
  const weekGroups    = groupByWeek(history);

  const xBtn = (index) => (
    <button
      onClick={() => deleteEntry(index)}
      style={{
        position: 'absolute', top: 4, right: 4,
        width: 16, height: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'transparent', border: 'none',
        cursor: 'pointer', opacity: 0.25, borderRadius: 2,
        transition: 'opacity 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
      onMouseLeave={e => e.currentTarget.style.opacity = '0.25'}
    >
      <FaTimes size={9} style={{ color: 'var(--text)' }} />
    </button>
  );

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      backgroundColor: 'var(--bg-base)',
      overflow: 'hidden', position: 'relative',
    }}>

      {/* Calendar overlay */}
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
            onClick={getExpGoal}
            disabled={!canCalc}
            style={{
              height: 38, paddingLeft: 16, paddingRight: 16,
              background: canCalc ? 'linear-gradient(to right, var(--red), #8b0000)' : 'var(--bg-raised)',
              border: '1px solid',
              borderColor: canCalc ? 'var(--red-dim)' : 'var(--border-subtle)',
              borderRadius: 'var(--r-sm)',
              color: canCalc ? 'white' : 'var(--text-muted)',
              fontSize: 12, fontWeight: '700',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: canCalc ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap',
            }}
          >
            Calculate
          </button>
        </div>

        {hasPlan && totalPlay > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
                {completedPlay} / {totalPlay} play days · {restQueue.length} rest days remaining
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
                    ? <FaExpand  size={9} style={{ color: 'var(--red-bright)' }} />
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

      {/* Claim pads */}
      {hasPlan && (
        <div style={{
          flexShrink: 0,
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex', gap: 10,
        }}>

          {/* Play day pad */}
          <div style={{
            flex: 2, padding: '12px 14px',
            backgroundColor: playQueue.length > 0 ? 'var(--bg-surface)' : 'transparent',
            border: '1px solid',
            borderColor: playQueue.length > 0 ? 'var(--border)' : 'var(--border-subtle)',
            borderRadius: 'var(--r-lg)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Next Play Day
            </span>
            {playQueue.length > 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: '700', color: 'var(--gold-bright)', lineHeight: 1 }}>
                    P {playQueue[0].level.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    +{playQueue[0].difference}
                  </span>
                </div>
                {nextDate && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>→ {nextDate}</span>
                )}
                <button
                  onClick={() => claimDay('play')}
                  style={{
                    height: 34,
                    background: 'linear-gradient(to right, var(--red), #8b0000)',
                    border: '1px solid var(--red-dim)',
                    borderRadius: 'var(--r-sm)',
                    color: 'white', fontSize: 12, fontWeight: '700',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Claim
                </button>
              </>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                All play days claimed
              </span>
            )}
          </div>

          {/* Rest day pad */}
          <div style={{
            flex: 1, padding: '12px 14px',
            backgroundColor: restQueue.length > 0 ? 'var(--bg-surface)' : 'transparent',
            border: '1px solid',
            borderColor: restQueue.length > 0 ? 'var(--border)' : 'var(--border-subtle)',
            borderRadius: 'var(--r-lg)',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Rest Day
            </span>
            {restQueue.length > 0 ? (
              <>
                <span style={{ fontSize: 18, fontWeight: '700', color: 'var(--text-dim)' }}>
                  {restQueue.length}
                  <span style={{ fontSize: 11, fontWeight: '400', color: 'var(--text-muted)', marginLeft: 4 }}>left</span>
                </span>
                {nextDate && (
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>→ {nextDate}</span>
                )}
                <button
                  onClick={() => claimDay('rest')}
                  style={{
                    height: 34,
                    backgroundColor: 'var(--bg-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--r-sm)',
                    color: 'var(--text-dim)', fontSize: 12, fontWeight: '600',
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Claim
                </button>
              </>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                None left
              </span>
            )}
          </div>
        </div>
      )}

      {/* History journal */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 24px' }}>
        {!hasPlan ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: 8,
          }}>
            <span style={{ fontSize: 14, color: 'var(--text-dim)', opacity: 0.6 }}>No plan yet.</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', opacity: 0.5, textAlign: 'center', maxWidth: 240 }}>
              Set your goal, weeks, and days per week, pick a start date, then hit Calculate.
            </span>
          </div>
        ) : history.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%',
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', opacity: 0.5, fontStyle: 'italic' }}>
              Claim your first day above to start the journal.
            </span>
          </div>
        ) : <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: showInfo ? 4 : 8 }}>
            <button
              onClick={() => setShowInfo(!showInfo)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                backgroundColor: 'transparent', border: 'none',
                cursor: 'pointer', padding: '2px 0',
              }}
            >
              <FaInfoCircle size={11} style={{
                color: showInfo ? 'var(--text-dim)' : 'var(--text-muted)',
                opacity: showInfo ? 0.7 : 0.35,
                transition: 'opacity 0.15s',
              }} />
            </button>
          </div>
          {showInfo && (
            <p style={{
              fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6,
              marginBottom: 10, opacity: 0.7,
            }}>
              Removing an entry also removes everything after it, returning those days to the queue.
            </p>
          )}
          {weekGroups.map(({ weekNum, entries, start, end, startIndex }) => (
          <div key={weekNum} style={{ marginBottom: 20 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 6, paddingBottom: 5,
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <span style={{ fontSize: 11, fontWeight: '700', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>
                WEEK {weekNum}
              </span>
              {start && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {start}{end && end !== start ? ` – ${end}` : ''}
                </span>
              )}
              <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {entries.filter(e => e.type === 'play').length} played
                {entries.filter(e => e.type === 'rest').length > 0
                  ? ` · ${entries.filter(e => e.type === 'rest').length} rest`
                  : ''}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {entries.map((entry, i) => {
                const globalIndex = startIndex + i;
                return entry.type === 'play' ? (
                  <div key={globalIndex} style={{
                    display: 'flex', alignItems: 'center',
                    gap: dense ? 8 : 10,
                    padding: dense ? '6px 10px' : '10px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    position: 'relative',
                  }}>
                    <span style={{ fontSize: dense ? 11 : 12, color: 'var(--text-muted)', width: dense ? 40 : 46, flexShrink: 0 }}>
                      {entry.date}
                    </span>
                    <span style={{ flex: 1, fontSize: dense || isMobile ? 13 : 16, fontWeight: '700', color: 'var(--gold-bright)' }}>
                      P {entry.level.toLocaleString()}
                    </span>
                    <span style={{ fontSize: dense ? 11 : 12, color: 'var(--text-dim)', flexShrink: 0 }}>
                      +{entry.difference}
                    </span>
                    {xBtn(globalIndex)}
                  </div>
                ) : (
                  <div key={globalIndex} style={{
                    display: 'flex', alignItems: 'center',
                    gap: dense ? 8 : 10,
                    padding: dense ? '6px 10px' : '10px 12px',
                    borderRadius: 'var(--r-md)',
                    border: '1px dashed rgba(255,255,255,0.08)',
                    position: 'relative',
                  }}>
                    <span style={{ fontSize: dense ? 11 : 12, color: 'var(--text-muted)', width: dense ? 40 : 46, flexShrink: 0, opacity: 0.5 }}>
                      {entry.date}
                    </span>
                    <span style={{ flex: 1, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', opacity: 0.4 }}>
                      rest
                    </span>
                    {xBtn(globalIndex)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        </>}
      </div>
    </div>
  );
};

export default ParagonTracker;
