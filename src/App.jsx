import { useState, useEffect, useRef } from 'react'
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
  const [screen, setScreen] = useState('home')
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  const isMobile = windowWidth < 768

  useEffect(() => {
    dispatch(getSavedData())
    dispatch(setDims())
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
      dispatch(setDims())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lives here rather than in any one screen so it fires regardless of which
  // screen the player is actually looking at — chapter advancement shouldn't
  // depend on having visited Home or the Season Journey screen recently.
  useEffect(() => {
    const chapterTasks = reduxState.journeyProgress.filter((t) => t.chapter === reduxState.currentChapter)
    const allDone = chapterTasks.length > 0 && chapterTasks.every((t) => t.completed)
    if (!allDone) return
    const idx = journeyChapters.indexOf(reduxState.currentChapter)
    if (idx === -1 || idx === journeyChapters.length - 1) return
    dispatch(setCurrentChapter({ val: journeyChapters[idx + 1], currentState: reduxStateRef.current }))
  }, [reduxState.journeyProgress, reduxState.currentChapter])

  const renderScreen = () => {
    switch (screen) {
      case 'home':           return <Welcome setScreen={setScreen} />
      case 'seasonJourney':  return <SeasonJourney />
      case 'conquests':      return <Conquests />
      case 'paragonCalc':    return <ParagonCalculator setScreen={setScreen} />
      case 'paragonTracker': return <ParagonTracker />
      case 'alterRites':     return <AlterOfRites />
      case 'haedrigsGift':   return <HaedrigsGift />
      case 'gearTracker':    return <GearTracker />
      default:               return <Welcome setScreen={setScreen} />
    }
  }

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
        {!isMobile && (
          <Sidebar screen={screen} setScreen={setScreen} />
        )}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {renderScreen()}
        </div>
      </div>

      <InstallPrompt />

      {isMobile && (
        <BottomNav screen={screen} setScreen={setScreen} />
      )}
    </div>
  )
}

export default App
