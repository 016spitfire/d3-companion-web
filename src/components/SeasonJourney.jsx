import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column' }}>
      {showChapterSelect && (
        <div
          onClick={() => setShowChapterSelect(false)}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 3,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          {chapters.map((chapter) => {
            const pct = getChapterProgress(chapter);
            return (
              <div
                key={chapter}
                style={{
                  width: '95%',
                  height: 60,
                  borderRadius: 5,
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(to right, rgba(244,3,1,1), rgba(73,0,7,1))',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${pct}%`,
                    background: 'linear-gradient(to right, rgba(12,128,106,1), rgba(1,41,34,1))',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: 7,
                    right: 7,
                    fontWeight: 'bold',
                    color: 'white',
                    fontSize: 16,
                  }}
                >
                  {pct}%
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(setCurrentChapter({ val: chapter, currentState: reduxStateRef.current }));
                    setShowChapterSelect(false);
                  }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: 'bold', fontSize: 24, color: 'white' }}>{chapter}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={() => setShowChapterSelect(!showChapterSelect)}
        style={{
          backgroundColor: 'black',
          height: 50,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          border: 'none',
          flexShrink: 0,
          width: '100%',
        }}
      >
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>
          {reduxStateRef.current.currentChapter}
        </span>
      </button>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 15px' }}>
        {journeyProgressRef.current.map((d) => {
          if (reduxStateRef.current.currentChapter !== d.chapter) return null;
          return (
            <button
              key={d.key}
              onClick={() =>
                dispatch(setJourneyProgress({ val: d, currentState: reduxStateRef.current }))
              }
              style={{
                width: 'calc(100% - 40px)',
                margin: '20px 20px 0',
                borderRadius: 5,
                background: d.completed
                  ? 'linear-gradient(to right, rgba(12,128,106,1), rgba(1,41,34,1))'
                  : 'linear-gradient(to right, rgba(244,3,1,1), rgba(73,0,7,1))',
                padding: 20,
                cursor: 'pointer',
                border: 'none',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {d.title && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={d.completed}
                    readOnly
                    style={{ marginRight: 12, width: 16, height: 16, flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 16, color: 'white', fontWeight: 'bold' }}>{d.title}</span>
                </div>
              )}
              <span style={{ fontWeight: 'bold', color: 'white', fontSize: 13 }}>
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
