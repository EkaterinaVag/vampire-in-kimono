import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '@store/gameStore'
import { GameLayout } from '@components/GameLayout'
import { ArtifactNotification } from '../ui/artifactNotification/ArtifactNotification'
import { LoadingScreen } from '../LoadingScreen'
import './Livingroom.css'

import bg from '@/assets/backgrounds/livingroom/livingroom.png'
import timer from '@/assets/ui/timer-2.png'
import catSeven from '@/assets/sprites/cat/cat-7.png'
import cat from '@/assets/sprites/cat/cat-8.png'
import furr from '@/assets/items/artifacts/furr.png'

function Livingroom() {
  const {
    setProgress,
    setLocation,
    obtainArtifact,
    applyFurClump,
    useChokopai: chokopaiFunction,
    chokopai
  } = useGameStore()

  const [dialogText, setDialogText] = useState('')
  const [isShowNextBtn, setIsShowNextBtn] = useState(false)
  const [showArtifact, setShowArtifact] = useState(false)

  // СОСТОЯНИЯ КОТА В ПАКЕТЕ
  const [bagX, setBagX] = useState(30)
  const [bagY, setBagY] = useState(50)
  const [bagDirection, setBagDirection] = useState(1)
  const [isBagCaught, setIsBagCaught] = useState(false)
  const [timeLeft, setTimeLeft] = useState(10)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [isRoundFailed, setIsRoundFailed] = useState(false)

  const clickCountRef = useRef(0)
  const timerRef = useRef<number | null>(null)
  const moveIntervalRef = useRef<number | null>(null)
  const dialogTimeoutRef = useRef<number | null>(null)

  const images = [bg, timer, catSeven, cat, furr]

  const runningPhrases = [
    '«Я - тигр! Я - лев! Я - тот, кто шуршит!»',
    '«Мяу! А где стена? А, вот она! БАМ!»',
    '«Если я ничего не вижу - значит, меня не существует! Пакет - моя маскировка!»',
    '«Хрум-хрум-хрум! Я ем пакет! Не наполнитель, но тоже вкусно!»',
  ]

  const clickPhrases = [
    '«Мя! Кто меня схватил? А, ты. Не мешай, я - ураган!»',
    '«Отпусти! Я не доел пакет!»',
    '«Ладно, ладно, я твой, только не дёргай так, уши болят!»',
  ]

  const savedPhrase =
    '«Фух. Ну и набегался. Пакет хороший. Шуршит. Ты, главное, не думай, что я глупый. Я просто… исследую мир. Исследую. Головой. В пакете.»'

  // СБРОС РАУНДА
  const resetRound = () => {
    setIsRoundFailed(false)
    setIsTimerActive(true)
    setTimeLeft(10)
    clickCountRef.current = 0
    setBagX(30)
    setBagY(50)
    setBagDirection(1)
    setDialogText('')
    if (chokopai.current > 0) {
      chokopaiFunction()
    }
  }

  // ПОКАЗ СЛУЧАЙНОЙ ФРАЗЫ ВО ВРЕМЯ БЕГА
  useEffect(() => {
    if (isBagCaught || isRoundFailed || !isTimerActive) return

    const showRandomPhrase = () => {
      if (isBagCaught || isRoundFailed || !isTimerActive) return
      const randomIndex = Math.floor(Math.random() * runningPhrases.length)
      setDialogText(runningPhrases[randomIndex])
      if (dialogTimeoutRef.current) clearTimeout(dialogTimeoutRef.current)
      dialogTimeoutRef.current = window.setTimeout(() => {
        if (!isBagCaught && !isRoundFailed) {
          setDialogText('')
        }
      }, 3000)
    }

    const interval = window.setInterval(showRandomPhrase, 4000)
    showRandomPhrase()

    return () => {
      clearInterval(interval)
      if (dialogTimeoutRef.current) clearTimeout(dialogTimeoutRef.current)
    }
  }, [isBagCaught, isRoundFailed, isTimerActive])

  // ТАЙМЕР
  useEffect(() => {
    if (!isTimerActive || isBagCaught) return

    timerRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          setIsTimerActive(false)
          setIsRoundFailed(true)
          setDialogText('Кот врезался в стену! Попробуй снова.')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isTimerActive, isBagCaught])

  // ДВИЖЕНИЕ ПАКЕТА
  useEffect(() => {
    if (isBagCaught || isRoundFailed) return

    moveIntervalRef.current = window.setInterval(() => {
      setBagX((prev) => {
        let newX = prev + bagDirection * (0.5 + Math.random() * 1.5)
        if (newX > 90 || newX < 5) {
          setBagDirection(-bagDirection)
          newX = Math.max(5, Math.min(90, newX))
          setBagY((prevY) => {
            const newY = prevY + (Math.random() - 0.5) * 3
            return Math.max(20, Math.min(80, newY))
          })
        }
        return newX
      })
      if (Math.random() < 0.1) {
        setBagY((prev) => {
          const newY = prev + (Math.random() - 0.5) * 5
          return Math.max(20, Math.min(80, newY))
        })
      }
    }, 80)

    return () => {
      if (moveIntervalRef.current) clearInterval(moveIntervalRef.current)
    }
  }, [bagDirection, isBagCaught, isRoundFailed])

  // КЛИК ПО ПАКЕТУ
  const handleBagClick = () => {
    if (isBagCaught || isRoundFailed || !isTimerActive) return

    clickCountRef.current += 1

    // Показываем случайную фразу при клике
    const randomIndex = Math.floor(Math.random() * clickPhrases.length)
    setDialogText(clickPhrases[randomIndex])
    if (dialogTimeoutRef.current) clearTimeout(dialogTimeoutRef.current)
    dialogTimeoutRef.current = window.setTimeout(() => {
      if (!isBagCaught && !isRoundFailed) {
        setDialogText('')
      }
    }, 1500)

    if (clickCountRef.current >= 3) {
      setIsBagCaught(true)
      setIsTimerActive(false)
      setDialogText(savedPhrase)
      setShowArtifact(true)
      obtainArtifact('fur_clump')
      applyFurClump()
      setProgress('livingroom_bagCatSaved', true)

      setTimeout(() => {
        setIsShowNextBtn(true)
      }, 3000)
    }
  }

  const handleContinue = () => {
    setLocation('moon_field')
  }

  const handleArtifactComplete = () => {
    setShowArtifact(false)
  }

  return (
    <LoadingScreen images={images}>
      <GameLayout
        dialogText={dialogText || 'Кот в пакете! Нажми на него 3 раза за 10 секунд!'}
        showNextBtn={isShowNextBtn}
        onNext={handleContinue}
      >
        <div className="livingroom">
          <img
            className="background"
            src={bg}
            alt="Livingroom background"
          />

          {isTimerActive && !isBagCaught && !isRoundFailed && (
            <div className="timer">
              <img src={timer} loading="eager" alt="Таймер" className="timer-icon" />
              <span className="timer-text">{timeLeft}</span>
            </div>
          )}

          {!isBagCaught && !isRoundFailed && (
            <div
              className="bag-sprite"
              style={{ left: `${bagX}%`, top: `${bagY}%` }}
              onClick={handleBagClick}
            >
              <img
                src={catSeven}
                alt="Пакет с котом"
                className="bag-image"
              />
              <span className="click-hint">[КЛИКНИ]</span>
            </div>
          )}

          {isBagCaught && (
            <div className="cat-saved">
              <img
                src={cat}
                alt="Спасённый кот"
                className="cat-happy"
              />
            </div>
          )}

          {isRoundFailed && (
            <div className="round-fail-overlay">
              <div className="round-fail-message">
                <span className="fail-icon">💥</span>
                <span className="fail-title">Кот врезался в стену!</span>
                <button className="fail-btn" onClick={resetRound}>
                  [ ПЕРЕЗАПУСТИТЬ ]
                </button>
              </div>
            </div>
          )}

          {showArtifact && (
            <ArtifactNotification
              artifactName="Клок шерсти"
              artifactIcon={furr}
              onComplete={handleArtifactComplete}
            />
          )}
        </div>
      </GameLayout>
    </LoadingScreen>
  )
}

export default Livingroom