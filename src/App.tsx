import { useGameStore } from './store/gameStore'
import Prologue from './components/Prologue/Prologue'
import Hallway from './components/hallway/Hallway'
import Playground from './components/playground/Playground'
import Kitchen from './components/kitchen/Kitchen'
import Bridge from './components/bridge/Bridge'
import Livingroom from './components/livingroom/Livingroom'
import MoonField from './components/moonField/moonField'

function App() {
  const currentLocation = useGameStore((state) => state.currentLocation)

  console.log(currentLocation)

  return (
    <>
      {currentLocation === 'prologue' && <Prologue />}
      {currentLocation === 'hallway' && <Hallway />}
      {currentLocation === 'playground' && <Playground />}
      {currentLocation === 'kitchen' && <Kitchen />}
      {currentLocation === 'bridge' && <Bridge />}
      {currentLocation === 'livingroom' && <Livingroom />}
      {currentLocation === 'moon_field' && <MoonField />}
    </>
  )
}

export default App