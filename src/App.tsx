import { useGameStore } from './store/gameStore'
import { Prologue } from './components/Prologue'

function App() {
  const currentLocation = useGameStore((state) => state.currentLocation)

  return (
    <>
      {currentLocation === 'prologue' && <Prologue />}
    </>
  )
}

export default App