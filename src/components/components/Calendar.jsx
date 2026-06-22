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
  const endDate   = startDate.endOf('month');
  const todayStr  = DateTime.now().toLocaleString({ month: 'short', day: 'numeric' });

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
        monthShort:  fixedDate[1]?.replaceAll(',', '') || '',
        date:        fixedDate[2]?.replaceAll(',', '') || fixedDate[1]?.replaceAll(',', '') || '',
        weekday:     fixedDate[0]?.replaceAll(',', '') || '',
        month:       testDate[0]?.replaceAll(',', '') || '',
        year:        testDate[2]?.replaceAll(',', '') || '',
        monthNumber: date.start.toLocaleString({ month: 'numeric' }),
      };
    });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const DaySize  = 38;

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)',
      padding: '14px 12px 10px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: DaySize * 7 + 24,
    }}>

      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
        <button
          onClick={() => setCurrentMonth(currentMonthRef.current.currentMonth.minus({ months: 1 }))}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            backgroundColor: 'var(--bg-raised)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}
        >
          <FaChevronLeft size={10} style={{ color: 'var(--text-dim)' }} />
        </button>

        <span style={{
          fontSize: 14, fontWeight: '700', color: 'var(--text)',
          minWidth: 130, textAlign: 'center',
        }}>
          {currentMonthRef.current.readable}
        </span>

        <button
          onClick={() => setCurrentMonth(currentMonthRef.current.currentMonth.plus({ months: 1 }))}
          style={{
            width: 28, height: 28, borderRadius: '50%',
            backgroundColor: 'var(--bg-raised)',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}
        >
          <FaChevronRight size={10} style={{ color: 'var(--text-dim)' }} />
        </button>
      </div>

      {/* Weekday headers */}
      <div style={{ display: 'flex', marginBottom: 4 }}>
        {weekDays.map((day) => (
          <div key={day} style={{ width: DaySize, height: 22, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.06em' }}>
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', width: DaySize * 7 }}>
        {intervals.map((d) => {
          const key          = `${d.monthShort}${d.date}`;
          const dateStr      = `${d.monthShort} ${d.date}`;
          const isCurrentMo  = currentMonthRef.current.readable.split(' ')[0] === d.month;
          const isChosen     = chosenDate === dateStr;
          const isToday      = todayStr === dateStr;

          return (
            <button
              key={key}
              onClick={() => pressFunc(d)}
              style={{
                width: DaySize, height: DaySize,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                backgroundColor: isChosen ? 'var(--red)' : 'transparent',
                border: isToday && !isChosen ? '1px solid var(--gold)' : 'none',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
              }}>
                <span style={{
                  fontSize: 12,
                  fontWeight: isChosen || isCurrentMo ? '700' : '400',
                  color: isChosen
                    ? 'white'
                    : isCurrentMo
                      ? 'var(--text)'
                      : 'var(--text-muted)',
                }}>
                  {d.date}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
