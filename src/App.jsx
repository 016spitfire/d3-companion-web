import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getSavedData, setDims } from './store/store'
import TopBar from './components/TopBar'
import Menu from './components/Menu'
import Welcome from './components/Welcome'
import SeasonJourney from './components/SeasonJourney'
import Conquests from './components/Conquests'
import ParagonCalculator from './components/ParagonCalculator'
import ParagonTracker from './components/ParagonTracker'
import AlterOfRites from './components/AlterOfRites'
import HaedrigsGift from './components/HaedrigsGift'
import GearTracker from './components/GearTracker'

const TOP_BAR_HEIGHT = 61

function App() {
  const dispatch = useDispatch()
  const [screen, setScreen] = useState('home')
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    dispatch(getSavedData())
    dispatch(setDims())
    const handleResize = () => dispatch(setDims())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const renderScreen = () => {
    switch (screen) {
      case 'home':          return <Welcome setScreen={setScreen} />
      case 'seasonJourney': return <SeasonJourney />
      case 'conquests':     return <Conquests />
      case 'paragonCalc':   return <ParagonCalculator />
      case 'paragonTracker':return <ParagonTracker />
      case 'alterRites':    return <AlterOfRites />
      case 'haedrigsGift':  return <HaedrigsGift />
      case 'gearTracker':   return <GearTracker />
      default:              return <Welcome setScreen={setScreen} />
    }
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 480,
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#1a0005',
        position: 'relative',
      }}
    >
      <TopBar
        topBarHeight={TOP_BAR_HEIGHT}
        setShowMenu={setShowMenu}
        showMenu={showMenu}
      />
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {renderScreen()}
        {showMenu && <Menu setScreen={setScreen} setShowMenu={setShowMenu} />}
      </div>
    </div>
  )
}

export default App
