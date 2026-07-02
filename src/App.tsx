import { useGameStore } from './store/gameStore'
import Prologue from './components/prologue/Prologue'
import Hallway from './components/hallway/Hallway'
import Playground from './components/playground/Playground'

function App() {
  const currentLocation = useGameStore((state) => state.currentLocation)

  console.log(currentLocation)

  return (
    <>
      {currentLocation === 'prologue' && <Prologue />}
      {currentLocation === 'hallway' && <Hallway />}
      {currentLocation === 'playground' && <Playground />}
    </>
  )
}

export default App