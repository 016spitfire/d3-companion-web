import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaChevronDown, FaCheck } from 'react-icons/fa';
import { selectReduxSlice, setJourneyProgress, setCurrentChapter } from '../store/store';

const SeasonJourney = () => {
  const dispatch = useDispatch();
  const reduxState = useSelector(selectReduxSlice);
  const reduxStateRef = useRef(reduxState);
  const journeyProgressRef = useRef(reduxState.journeyProgress);
  const [chapters, setChapters] = useState([]);
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  reduxStateRef.current = reduxState;
  journeyProgressRef.current = reduxState.journeyProgress;

  useEffect(() => {
    const allChapters = [];
    journeyProgressRef.current.forEach((d) => {
      if (!allChapters.includes(d.chapter)) allChapters.push(d.chapter);
    });
    setChapters(allChapters);
  }, []);

  const getChapterProgress = (chapter) => {
    let total = 0;
    let complete = 0;
    journeyProgressRef.current.forEach((d) => {
      if (d.chapter === chapter) {
        total++;
        if (d.completed) complete++;
      }
    });
    return total > 0 ? Math.round((complete / total) * 100) : 0;
  };

  const currentPct = getChapterProgress(reduxStateRef.current.currentChapter);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-base)' }}>

      {/* Chapter selector overlay */}
      {showChapterSelect && (
        <div
          onClick={() => setShowChapterSelect(false)}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 10, padding: 20,
          }}
        >
          {chapters.map((chapter) => {
            const pct = getChapterProgress(chapter);
            const isActive = chapter === reduxStateRef.current.currentChapter;
            return (
              <button
                key={chapter}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(setCurrentChapter({ val: chapter, currentState: reduxStateRef.current }));
                  setShowChapterSelect(false);
                }}
                style={{
                  width: '100%',
                  maxWidth: 420,
                  height: 56,
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 'var(--r-md)',
                  border: isActive ? '1px solid var(--red-bright)' : '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 16,
                  paddingRight: 16,
                }}
              >
                {/* Progress fill */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${pct}%`,
                  backgroundColor: 'var(--red-glow)',
                  transition: 'width 0.3s ease',
                }} />
                <span style={{ position: 'relative', flex: 1, fontWeight: '600', fontSize: 15, color: 'var(--text)', textAlign: 'left' }}>
                  {chapter}
                </span>
                <span style={{ position: 'relative', fontSize: 13, color: pct === 100 ? 'var(--gold-bright)' : 'var(--text-dim)' }}>
                  {pct}%
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Chapter header */}
      <button
        onClick={() => setShowChapterSelect(true)}
        style={{
          flexShrink: 0,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingLeft: 20,
          paddingRight: 16,
          backgroundColor: '#111113',
          borderBottom: '1px solid var(--border)',
          cursor: 'pointer',
          gap: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Progress bar behind header */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${currentPct}%`,
          backgroundColor: 'rgba(196,18,48,0.1)',
          pointerEvents: 'none',
        }} />
        <span style={{ position: 'relative', fontWeight: '700', fontSize: 15, color: 'var(--text)', letterSpacing: '0.03em' }}>
          {reduxStateRef.current.currentChapter}
        </span>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: currentPct === 100 ? 'var(--gold-bright)' : 'var(--text-dim)' }}>
            {currentPct}%
          </span>
          <FaChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
        </div>
      </button>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}>
        {journeyProgressRef.current.map((d) => {
          if (reduxStateRef.current.currentChapter !== d.chapter) return null;
          return (
            <button
              key={d.key}
              onClick={() => dispatch(setJourneyProgress({ val: d, currentState: reduxStateRef.current }))}
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                padding: '14px 16px',
                marginBottom: 8,
                borderRadius: 'var(--r-md)',
                border: '1px solid',
                borderColor: d.completed ? 'rgba(196,18,48,0.3)' : 'var(--border-subtle)',
                backgroundColor: d.completed ? 'rgba(196,18,48,0.07)' : 'var(--bg-surface)',
                cursor: 'pointer',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Checkbox */}
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  border: '1px solid',
                  borderColor: d.completed ? 'var(--red-bright)' : 'var(--border-subtle)',
                  backgroundColor: d.completed ? 'var(--red)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {d.completed && <FaCheck size={9} style={{ color: 'white' }} />}
                </div>
                {d.title && (
                  <span style={{
                    fontSize: 14, fontWeight: '600',
                    color: d.completed ? 'var(--text-dim)' : 'var(--text)',
                    textDecoration: d.completed ? 'line-through' : 'none',
                  }}>
                    {d.title}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                paddingLeft: 28,
                lineHeight: 1.5,
              }}>
                {d.long || d.goal}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SeasonJourney;
