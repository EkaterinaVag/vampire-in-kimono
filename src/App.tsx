import { useGameStore } from './store/gameStore'
import { Prologue } from './components/Prologue/Prologue'

function App() {
  const currentLocation = useGameStore((state) => state.currentLocation)

  console.log(currentLocation)

  return (
    <>
      {currentLocation === 'prologue' && <Prologue />}
    </>
  )
}

export default App