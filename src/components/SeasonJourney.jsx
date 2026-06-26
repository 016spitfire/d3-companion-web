import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaChevronDown, FaChevronRight, FaCheck } from 'react-icons/fa';
import { selectReduxSlice, setJourneyProgress, setJourneyCascade, setCurrentChapter } from '../store/store';
import { computeJourneyCascadeUncompletes } from '../utils/journeyCascade';

const SeasonJourney = () => {
  const dispatch = useDispatch();
  const reduxState = useSelector(selectReduxSlice);
  const reduxStateRef = useRef(reduxState);
  const journeyProgressRef = useRef(reduxState.journeyProgress);
  const [chapters, setChapters] = useState([]);
  const [showChapterSelect, setShowChapterSelect] = useState(false);
  const [cascadeWarning, setCascadeWarning] = useState(null); // { task, affectedKeys } | null
  reduxStateRef.current = reduxState;
  journeyProgressRef.current = reduxState.journeyProgress;

  // Unchecking a task is safe to do immediately unless something already
  // completed only stayed that way because of it (e.g. unchecking GR20 Solo
  // while GR30+ are checked) — same split as the Altar's lock-vs-unlock.
  const handleTaskClick = (task) => {
    if (task.completed) {
      const affected = computeJourneyCascadeUncompletes(task.key, journeyProgressRef.current);
      if (affected.length > 0) {
        setCascadeWarning({ task, affectedKeys: affected });
        return;
      }
    }
    dispatch(setJourneyProgress({ val: task, currentState: reduxStateRef.current }));
  };
  const confirmCascade = () => {
    dispatch(setJourneyCascade([cascadeWarning.task.key, ...cascadeWarning.affectedKeys], reduxStateRef.current));
    setCascadeWarning(null);
  };

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

  const currentChapterIndex = chapters.indexOf(reduxStateRef.current.currentChapter);
  const isLastChapter = currentChapterIndex === -1 || currentChapterIndex === chapters.length - 1;

  const goToNextChapter = () => {
    if (isLastChapter) return;
    dispatch(setCurrentChapter({ val: chapters[currentChapterIndex + 1], currentState: reduxStateRef.current }));
  };

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
      <div
        style={{
          flexShrink: 0,
          height: 52,
          display: 'flex',
          backgroundColor: '#111113',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          onClick={() => setShowChapterSelect(true)}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 20,
            paddingRight: 16,
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

        {/* Next chapter shortcut */}
        <button
          onClick={goToNextChapter}
          disabled={isLastChapter}
          title={isLastChapter ? 'Last chapter' : 'Next chapter'}
          style={{
            width: 52,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderLeft: '1px solid var(--border)',
            cursor: isLastChapter ? 'default' : 'pointer',
            opacity: isLastChapter ? 0.3 : 1,
          }}
        >
          <FaChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 24px' }}>
        {journeyProgressRef.current.map((d) => {
          if (reduxStateRef.current.currentChapter !== d.chapter) return null;
          return (
            <button
              key={d.key}
              onClick={() => handleTaskClick(d)}
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

      {/* Cascade warning — shown instead of unchecking immediately whenever
          other already-completed tasks only stayed that way because of this one. */}
      {cascadeWarning && (
        <div
          onClick={() => setCascadeWarning(null)}
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 380,
              backgroundColor: '#161618',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-lg)',
              padding: '20px 20px 16px',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
          >
            <span style={{ fontSize: 15, fontWeight: '700', color: 'var(--text)' }}>
              This will also uncheck {cascadeWarning.affectedKeys.length} other task{cascadeWarning.affectedKeys.length === 1 ? '' : 's'}
            </span>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              These were only complete because {cascadeWarning.task.title} was — none of them could really be done without it:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {cascadeWarning.affectedKeys.map((key) => (
                <span key={key} style={{
                  fontSize: 12, fontWeight: '600', color: 'var(--text-dim)',
                  backgroundColor: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-sm)', padding: '3px 8px',
                }}>
                  {journeyProgressRef.current.find((t) => t.key === key)?.title}
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                onClick={() => setCascadeWarning(null)}
                style={{
                  flex: 1, height: 42,
                  backgroundColor: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-md)', color: 'var(--text-dim)',
                  fontSize: 13, fontWeight: '700', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmCascade}
                style={{
                  flex: 1, height: 42,
                  background: 'linear-gradient(to right, var(--red), #8b0000)',
                  border: '1px solid var(--red-dim)',
                  borderRadius: 'var(--r-md)', color: 'white',
                  fontSize: 13, fontWeight: '700', cursor: 'pointer',
                }}
              >
                Uncheck Them All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeasonJourney;
