import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '@store/gameStore'
import './Hallway.css'
import { GameLayout } from '@components/GameLayout'
import { ArtifactNotification } from '../ui/artifactNotification/ArtifactNotification'

function Hallway() {
  const { setProgress, setLocation, obtainArtifact, addChokopai, applyFurClump } =
    useGameStore()

  const [timeLeft, setTimeLeft] = useState(5)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [isCatSaved, setIsCatSaved] = useState(false)
  const [dialogText, setDialogText] = useState('')
  const [isShowHextBtn, setIsShowHextBtn] = useState(false)
  const [showArtifact, setShowArtifact] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isTimerActive) return

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setIsTimerActive(false)
          setDialogText(
            'Амм… Вкусно. Знаешь, в этом наполнителе нотки сосны и лёгкое послевкусие… твоего разочарования'
          )
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerActive])


  const handleCatClick = () => {
    if (isCatSaved) return

    clearInterval(timerRef.current!)
    setIsTimerActive(false)
    setIsCatSaved(true)
    setProgress('hallway_catSaved', true)
    obtainArtifact('wisdom_purr')
    addChokopai()
    applyFurClump()

    setShowArtifact(true)
    setDialogText(
      '«Ты спас меня от меня самого. Держи - это мудрость. Она хрустит. Не ешь её. Положи в карман кимоно. Так же держи еще один чокопай. Пригодится»'
    )
  }

  const handleArtifactComplete = () => {
    setShowArtifact(false)
  }

  const handleClickNextLevel = () => {
    setDialogText(
      '«Дальше - детская площадка. Там… дети. Не бойся. Они не кусаются. В отличие от тебя. Хотя… нет, они тоже кусаются. Беги. Или стой. Я просто буду рядом.»'
    )

    setTimeout(() => setIsShowHextBtn(true), 300)
  }

  const handleContinue = () => {
    setLocation('playground')
  }

  return (
    <GameLayout
      dialogText={dialogText || 'Кот жуёт наполнитель. У тебя есть 3 секунды, чтобы его спасти!'}
      showNextBtn={isShowHextBtn}
      onNext={handleContinue}
    >
      <div className="hallway">
        <img
          className="background"
          src="src/assets/backgrounds/hallway/hallway.png"
          alt="Hallway background"
        />

        <div
          className={`cat-sprite ${isCatSaved ? 'saved' : ''} ${!isCatSaved && !isTimerActive ? 'offended' : ''
            }`}
          onClick={isTimerActive ? handleCatClick : handleClickNextLevel}
        >
          <img
            className='cat-image'
            src={`${isCatSaved ? "src/assets/sprites/cat/cat-3.png" : "src/assets/sprites/cat/cat.png"}`}
            alt="Cat eating litter"
          />
          <div className="litter-trails">
            <span className="litter-trail trail-1"></span>
            <span className="litter-trail trail-2"></span>
            <span className="litter-trail trail-3"></span>
          </div>
        </div>

        {isTimerActive && !isCatSaved && (
          <div className="timer">
            <img src="src/assets/ui/timer-2.png" loading="eager" alt="Таймер" className="timer-icon" />
            <span className="timer-text">{timeLeft}</span>
          </div>
        )}

        {showArtifact && (
          <ArtifactNotification
            artifactName="Мудрое мурчание"
            artifactIcon="src/assets/items/artifacts/purr.png"
            onComplete={handleArtifactComplete}
          />
        )}
      </div>
    </GameLayout>
  )
}

export default Hallway
