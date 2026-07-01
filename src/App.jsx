import { useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { getSavedData, setDims, selectReduxSlice, setCurrentChapter } from './store/store'
import { journeyChapters } from './data/seasonJourneyData'
import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Welcome from './components/Welcome'
import SeasonJourney from './components/SeasonJourney'
import Conquests from './components/Conquests'
import ParagonCalculator from './components/ParagonCalculator'
import ParagonTracker from './components/ParagonTracker'
import AlterOfRites from './components/AlterOfRites'
import HaedrigsGift from './components/HaedrigsGift'
import GearTracker from './components/GearTracker'
import InstallPrompt from './components/InstallPrompt'

const TOP_BAR_HEIGHT = 61

function App() {
  const dispatch = useDispatch()
  const reduxState = useSelector(selectReduxSlice)
  const reduxStateRef = useRef(reduxState)
  reduxStateRef.current = reduxState

  const isMobile = reduxState.width < 768

  useEffect(() => {
    dispatch(getSavedData())
    dispatch(setDims())
    const handleResize = () => dispatch(setDims())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const chapterTasks = reduxState.journeyProgress.filter((t) => t.chapter === reduxState.currentChapter)
    const allDone = chapterTasks.length > 0 && chapterTasks.every((t) => t.completed)
    if (!allDone) return
    const idx = journeyChapters.indexOf(reduxState.currentChapter)
    if (idx === -1 || idx === journeyChapters.length - 1) return
    dispatch(setCurrentChapter({ val: journeyChapters[idx + 1], currentState: reduxStateRef.current }))
  }, [reduxState.journeyProgress, reduxState.currentChapter])

  return (
    <div
      style={{
        width: '100%',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1a0005',
      }}
    >
      <TopBar topBarHeight={TOP_BAR_HEIGHT} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {!isMobile && <Sidebar />}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Routes>
            <Route path="/"          element={<Welcome />} />
            <Route path="/journey"   element={<SeasonJourney />} />
            <Route path="/conquests" element={<Conquests />} />
            <Route path="/paragon"   element={<ParagonCalculator />} />
            <Route path="/tracker"   element={<ParagonTracker />} />
            <Route path="/altar"     element={<AlterOfRites />} />
            <Route path="/haedrig"   element={<HaedrigsGift />} />
            <Route path="/gear"      element={<GearTracker />} />
            <Route path="*"          element={<Welcome />} />
          </Routes>
        </div>
      </div>

      <InstallPrompt />

      {isMobile && <BottomNav />}
    </div>
  )
}

export default App
