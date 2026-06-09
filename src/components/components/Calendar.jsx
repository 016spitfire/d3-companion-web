import { useRef, useState } from 'react';
import { DateTime, Interval } from 'luxon';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Calendar = ({ pressFunc, chosenDate }) => {
  const [currentMonth, setCurrentMonth] = useState(DateTime.now());
  const currentMonthRef = useRef(currentMonth);
  currentMonthRef.current = {
    currentMonth,
    readable: currentMonth.toLocaleString({ month: 'long', year: 'numeric' }),
  };

  const startDate = currentMonthRef.current.currentMonth.startOf('month');
  const endDate = startDate.endOf('month');
  const intervals = Interval.fromDateTimes(
    startDate.startOf('week'),
    endDate.endOf('week')
  )
    .splitBy({ day: 1 })
    .map((date) => {
      const fixedDate = date.start
        .toLocaleString({ month: 'short', day: 'numeric', weekday: 'short' })
        .split(' ');
      const testDate = date.start
        .toLocaleString({ month: 'long', day: 'numeric', year: 'numeric' })
        .split(' ');
      return {
        monthShort: fixedDate[1]?.replaceAll(',', '') || '',
        date: fixedDate[2]?.replaceAll(',', '') || fixedDate[1]?.replaceAll(',', '') || '',
        weekday: fixedDate[0]?.replaceAll(',', '') || '',
        month: testDate[0]?.replaceAll(',', '') || '',
        year: testDate[2]?.replaceAll(',', '') || '',
        monthNumber: date.start.toLocaleString({ month: 'numeric' }),
      };
    });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const DayWidth = 36;

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: 8,
        borderRadius: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: DayWidth * 7 + 16,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <button
          onClick={() => setCurrentMonth(currentMonthRef.current.currentMonth.minus({ months: 1 }))}
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: 'rgba(200,200,200,1)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 10,
          }}
        >
          <FaChevronLeft size={10} />
        </button>
        <span style={{ fontSize: 16, fontWeight: 'bold' }}>
          {currentMonthRef.current.readable}
        </span>
        <button
          onClick={() => setCurrentMonth(currentMonthRef.current.currentMonth.plus({ months: 1 }))}
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            backgroundColor: 'rgba(200,200,200,1)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginLeft: 10,
          }}
        >
          <FaChevronRight size={10} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 6 }}>
        {weekDays.map((day) => (
          <div
            key={day}
            style={{
              width: DayWidth,
              height: 25,
              borderRadius: 25,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(234,234,234,1)',
            }}
          >
            <span style={{ fontWeight: 'bold', fontSize: 11 }}>{day}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', width: DayWidth * 7 }}>
        {intervals.map((d) => {
          const key = `${d.monthShort}${d.date}`;
          const isCurrentMonth =
            currentMonthRef.current.readable.split(' ')[0] === d.month;
          const isChosen = chosenDate === `${d.monthShort} ${d.date}`;
          return (
            <button
              key={key}
              onClick={() => pressFunc(d)}
              style={{
                width: DayWidth,
                height: DayWidth / 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginBottom: 2,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  border: isChosen ? '3px solid black' : 'none',
                  backgroundColor: isCurrentMonth ? 'rgb(149,223,239)' : 'transparent',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 'bold', fontSize: 11 }}>{d.date}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
