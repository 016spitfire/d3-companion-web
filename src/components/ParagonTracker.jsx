import { useState, useRef, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DateTime, Interval } from 'luxon';
import { FaCalendar } from 'react-icons/fa';
import { getNumber, getParagonFromExp } from '../utils/nonUIFuncs';
import {
  selectReduxSlice,
  setGoalParagons,
  setWeeks,
  setDaysPerWeek,
  setGoalData,
  setNewStartDate,
} from '../store/store';
import paragonExpData from '../data/paragonExpData';
import Calendar from './components/Calendar';

const ParagonTracker = () => {
  const date = DateTime.local();
  const reduxState = useSelector(selectReduxSlice);
  const dispatch = useDispatch();
  const reduxStateRef = useRef(reduxState);
  const [paragonDates, setParagonDates] = useState([]);
  const [showCalendar, setShowCalendar] = useState(true);
  reduxStateRef.current = reduxState;

  useLayoutEffect(() => {
    if (reduxStateRef.current.startDate !== null) setShowCalendar(false);
  }, []);

  const getExpGoal = () => {
    const state = reduxStateRef.current;
    const newGoal = paragonExpData.find((d) => getNumber(d.level) === state.goalParagons);
    if (!newGoal) return;
    const days = state.weeks * state.daysPerWeek;
    const dailyGoal = getNumber(newGoal.totalExp) / days;
    const goalsArr = [];
    let highestParagon = 0;
    let lastDayP = 0;
    for (let i = 1; i <= days; i++) {
      const dateGoal = paragonDates[i - 1];
      const exp = Math.ceil(dailyGoal * i);
      const paragon = getParagonFromExp({ highestParagon, exp, data: paragonExpData });
      if (!paragon) break;
      highestParagon = getNumber(paragon.level);
      goalsArr.push({
        key: i,
        goal: exp,
        level: getNumber(paragon.level),
        difference: getNumber(paragon.level) - lastDayP,
        completed: false,
        date: dateGoal,
      });
      lastDayP = getNumber(paragon.level);
    }
    dispatch(setGoalData(goalsArr, state));
  };

  const setCompleted = (day) => {
    const state = reduxStateRef.current;
    const newAllGoals = state.goalData.map((d) => {
      let newD = { ...d };
      newD.completed = d.key <= day.key;
      if (day.completed === true && d.key === day.key) newD.completed = false;
      return newD;
    });
    dispatch(setGoalData(newAllGoals, state));
  };

  const getStartDate = (data) => {
    const testDate = DateTime.fromObject({
      year: data.year,
      month: data.monthNumber,
      day: data.date,
    });
    const endDate = testDate.plus({ day: Number(reduxStateRef.current.weeks) * 7 - 1 });
    const intervals = Interval.fromDateTimes(testDate.startOf('day'), endDate.endOf('day'))
      .splitBy({ day: 1 })
      .map((d) => d.start.toLocaleString({ month: 'short', day: 'numeric' }));
    dispatch(setNewStartDate(`${data.monthShort} ${data.date}`, reduxStateRef.current));
    setParagonDates(intervals);
  };

  const inputStyle = {
    marginTop: 4,
    backgroundColor: 'white',
    fontSize: 14,
    height: 22,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 10,
    fontWeight: 'bold',
    border: 'none',
    minWidth: 60,
    textAlign: 'center',
  };
  const labelStyle = { color: 'white', fontSize: 16, fontWeight: 'bold', marginRight: 6 };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.5)', overflowY: 'hidden' }}>
      {/* Sticky header */}
      <div
        style={{
          borderTop: '1px solid white',
          width: '100%',
          paddingTop: 5,
          paddingBottom: 5,
          paddingLeft: '2.5%',
          paddingRight: '2.5%',
          backgroundColor: 'rgba(120,40,30,1)',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          {[
            { label: 'Goal', value: reduxState.goalParagons, action: setGoalParagons },
            { label: 'Weeks', value: reduxState.weeks, action: setWeeks },
            { label: 'Days/Wk', value: reduxState.daysPerWeek, action: setDaysPerWeek },
          ].map(({ label, value, action }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
              <span style={labelStyle}>{label}</span>
              <input
                type="number"
                value={value}
                onChange={(e) => dispatch(action(Number(e.target.value) || 0, reduxStateRef.current))}
                style={inputStyle}
              />
            </div>
          ))}
        </div>

        {showCalendar && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
            <span style={{ color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
              Choose Start Date
            </span>
            <Calendar pressFunc={getStartDate} chosenDate={reduxState.startDate} />
          </div>
        )}

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          style={{
            backgroundColor: 'rgba(0,0,0,1)',
            position: 'absolute',
            top: 30,
            right: -5,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '3px solid white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <FaCalendar color="white" size={16} />
        </button>

        <button
          onClick={getExpGoal}
          style={{
            width: '100%',
            height: 38,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(90,20,15,1)',
            marginTop: 6,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <span style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Calculate Goal</span>
        </button>

        {reduxState.goalData.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              backgroundColor: 'white',
              marginTop: 4,
              padding: '2px 0',
            }}
          >
            {[0, 1].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '45%' }}>
                <span style={{ fontSize: 12, fontWeight: 'bold', width: 45 }}>Day</span>
                <span style={{ fontSize: 12, flex: 1 }}>Paragon</span>
                <span style={{ fontSize: 12 }}>Diff</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable goal list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          alignContent: 'flex-start',
          padding: '0 2.5% 15px',
        }}
      >
        {reduxState.goalData.map((d) => (
          <button
            key={d.key}
            onClick={() => setCompleted(d)}
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '45%',
              marginTop: 2,
              height: 25,
              borderRadius: 2,
              backgroundColor: d.completed ? 'rgba(150,255,150,1)' : 'rgba(215,215,255,0.7)',
              border: 'none',
              cursor: 'pointer',
              padding: '0 5px',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: 11, width: 55, textAlign: 'left' }}>{d.date}</span>
            <span style={{ flex: 1, fontSize: 11, textAlign: 'left' }}>{d.level}</span>
            <span style={{ fontSize: 11 }}>{d.difference}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ParagonTracker;
