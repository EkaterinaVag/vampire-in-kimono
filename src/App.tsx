import { useGameStore } from './store/gameStore'
import Prologue from './components/prologue/Prologue'
import Hallway from './components/hallway/Hallway'

function App() {
  const currentLocation = useGameStore((state) => state.currentLocation)

  console.log(currentLocation)

  return (
    <>
      {currentLocation === 'prologue' && <Prologue />}
      {currentLocation === 'hallway' && <Hallway />}

    </>
  )
}

export default App