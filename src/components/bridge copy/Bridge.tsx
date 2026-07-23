import { useState } from 'react'
import { useGameStore } from '@store/gameStore'
import { GameLayout } from '@components/GameLayout'
import { ArtifactNotification } from '../ui/artifactNotification/ArtifactNotification'
import './Bridge.css'

function Bridge() {
  const {
    setProgress,
    setLocation,
    obtainArtifact,
    addItem,
    addSleepiness,
    addChokopai,
    effects
  } = useGameStore()

  const [dialogText, setDialogText] = useState('')
  const [isShowNextBtn, setIsShowNextBtn] = useState(false)
  const [showArtifact, setShowArtifact] = useState(false)

  const handleContinue = () => {
    return
    setLocation('livingroom')
  }

  const handleArtifactComplete = () => {
    setShowArtifact(false)
  }

  return (
    <GameLayout
      dialogText={dialogText}
      showNextBtn={isShowNextBtn}
      onNext={handleContinue}
    >
        <div className="bridge">
          <img
            className="background"
            src={"src/assets/backgrounds/bridge/bridge.png"}
            alt="Bridge background"
          />

          {showArtifact && (
            <ArtifactNotification
              artifactName=""
              artifactIcon="src/assets/items/artifacts/dill.png"
              onComplete={handleArtifactComplete}
            />
          )}
        </div>
    </GameLayout >
  )
}

export default Bridge