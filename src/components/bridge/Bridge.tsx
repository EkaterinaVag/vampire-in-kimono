import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '@store/gameStore'
import { GameLayout } from '@components/GameLayout'
import { ArtifactNotification } from '../ui/artifactNotification/ArtifactNotification'
import { LoadingScreen } from '../LoadingScreen'
import getPlayerSprite from '@/utils/playerSprites'
import usePlayerMovement from '@/hooks/usePlayerMovement'
import RoundFailOverlay from '../ui/roundFailOverlay/RoundFailOverlay'
import './Bridge.css'

import catSprite from '@/assets/sprites/cat/cat-9.png'
import bg from '@/assets/backgrounds/bridge/bridge-1.jpg'
import bgTwo from '@/assets/backgrounds/bridge/bridge-2.jpg'
import bgThree from '@/assets/backgrounds/bridge/bridge-3.jpg'
import playerStand from '@/assets/sprites/player/stand.png'
import playerLeft from '@/assets/sprites/player/left.png'
import playerRight from '@/assets/sprites/player/right.png'
import paw from '@/assets/items/artifacts/paw.png'

function BridgeContent() {
  const {
    setProgress,
    setLocation,
    obtainArtifact,
    useChokopai: chokopaiFunction,
    resetChokopai,
    chokopai,
  } = useGameStore()

  const [playerY, setPlayerY] = useState(0)
  const [isFalling, setIsFalling] = useState(false)

  const [dialogText, setDialogText] = useState('')
  const [isShowNextBtn, setIsShowNextBtn] = useState(false)
  const [showArtifact, setShowArtifact] = useState(false)

  const [attempts, setAttempts] = useState(0)
  const [isPassed, setIsPassed] = useState(false)
  const [showCracks, setShowCracks] = useState(false)
  const [shakeAmount, setShakeAmount] = useState(0)

  const [isGameOver, setIsGameOver] = useState(false)
  const [bridgeHealth, setBridgeHealth] = useState(100)
  const [isRepairing, setIsRepairing] = useState(false)

  const [isResetting, setIsResetting] = useState(false)

  const {
    playerX,
    setPlayerX,
    isMoving,
    isMovingLeft,
    currentScene,
    setCurrentScene,
    isShiftHeld,
    resetMovement
  } = usePlayerMovement({
    maxX: 95,
    initialX: 40,
    scenes: 3,
    isEnabled: !isPassed && !isShowNextBtn && !isFalling && !isGameOver && !isRepairing && !isResetting,
  })

  const fallAnimationRef = useRef<number | null>(null)
  const runningTimeRef = useRef<number>(0)
  const healthThresholdRef = useRef<number>(100)

  const dialogTimeoutRef = useRef<number | null>(null)
  const repairTimeoutRef = useRef<number | null>(null)
  const fallTimeoutRef = useRef<number | null>(null)
  const resetTimeoutRef = useRef<number | null>(null)

  const clearAllTimeouts = () => {
    if (dialogTimeoutRef.current) {
      clearTimeout(dialogTimeoutRef.current)
      dialogTimeoutRef.current = null
    }
    if (repairTimeoutRef.current) {
      clearTimeout(repairTimeoutRef.current)
      repairTimeoutRef.current = null
    }
    if (fallTimeoutRef.current) {
      clearTimeout(fallTimeoutRef.current)
      fallTimeoutRef.current = null
    }
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }
    if (fallAnimationRef.current) {
      clearInterval(fallAnimationRef.current)
      fallAnimationRef.current = null
    }
  }

  // ГЕНЕРАЦИЯ СЛУЧАЙНЫХ ЗНАЧЕНИЙ ДЛЯ ОБЛОМКОВ
  const [debrisPieces] = useState(() => {
    return [...Array(20)].map(() => ({
      left: 10 + Math.random() * 80,
      top: 10 + Math.random() * 60,
      width: 5 + Math.random() * 20,
      height: 5 + Math.random() * 20,
      delay: Math.random() * 0.5,
      rotation: Math.random() * 360,
      speed: 0.5 + Math.random() * 1,
    }))
  })

  // ГЕНЕРАЦИЯ СЛЕДОВ ПАДЕНИЯ
  const [fallTrails] = useState(() => {
    return [...Array(12)].map(() => ({
      left: -40 + Math.random() * 80,
      delay: Math.random() * 0.5,
      width: 3 + Math.random() * 8,
      height: 10 + Math.random() * 30,
      opacity: 0.3 + Math.random() * 0.7,
    }))
  })

  // ПРОВЕРКА И ТРАТА ЧОКОПАЕВ ПРИ УМЕНЬШЕНИИ ЗДОРОВЬЯ МОСТА
  const checkAndSpendChokopai = (currentHealth: number) => {
    const healthLost = healthThresholdRef.current - currentHealth
    const chokopaiToSpend = Math.floor(healthLost / 25)

    if (chokopaiToSpend > 0 && chokopai.current > 0) {
      const actualSpend = Math.min(chokopaiToSpend, chokopai.current)

      for (let i = 0; i < actualSpend; i++) {
        chokopaiFunction()
      }

      healthThresholdRef.current = currentHealth + (healthLost % 25)
    }
  }

  // ОБРАБОТКА КОНЦА ТУРА
  const handleGameOver = () => {
    setIsFalling(false)
    setIsGameOver(true)

    clearAllTimeouts()

    if (fallAnimationRef.current) {
      clearInterval(fallAnimationRef.current)
      fallAnimationRef.current = null
    }

    setBridgeHealth(0)
    healthThresholdRef.current = 0

    setShowCracks(false)
    setShakeAmount(0)

    setDialogText('Все жизни потеряны! Ты падаешь в пропасть... Тур окончен!')
  }

  // ПОЛНЫЙ СБРОС ТУРА
  const resetFullTour = () => {
    setIsResetting(true)
    clearAllTimeouts()

    setIsGameOver(false)
    setIsFalling(false)
    setIsPassed(false)
    setShowCracks(false)
    setShakeAmount(0)
    setPlayerY(0)
    setPlayerX(40)
    setCurrentScene(0)
    runningTimeRef.current = 0
    setIsShowNextBtn(false)
    setShowArtifact(false)
    setIsRepairing(false)
    setDialogText('')

    setBridgeHealth(100)
    healthThresholdRef.current = 100

    resetMovement()
    resetChokopai()

    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    // Сообщения для провалов
    const failMessages = [
      'Мя. Провалился. Быстро бежал. А куда? Мост - это не спринт. Попробуй ещё раз. Я подожду. Мне некуда спешить.',
      'Ну вот, опять. Ты там что, марафонец? Мост, блин, а не беговая дорожка.',
      'Пф... Ну ты и торопыга! Мост от твоего бега аж зашатался. Медленнее, медленнее, я не хочу ловить тебя внизу.',
      'Я начинаю думать, что ты это специально делаешь. Просто чтобы на меня впечатление произвести. Ну, впечатлён. Теперь иди нормально.'
    ]

    let message = 'Мя. Долго же ты. Мост... Ну, давай, иди. Я тут посижу, подожду. Можешь не спешить. Я вообще никуда не тороплюсь. Мне и тут хорошо.'

    if (newAttempts >= 1) {
      const cyclicIndex = (newAttempts - 1) % failMessages.length
      message = failMessages[cyclicIndex]
    }

    setDialogText(message)

    setTimeout(() => {
      setIsResetting(false)
    }, 100)
  }

  // АНИМАЦИЯ ПАДЕНИЯ
  const startFalling = () => {
    setIsFalling(true)
    setPlayerY(0)
    setShakeAmount(0)
    setShowCracks(false)

    clearAllTimeouts()

    setDialogText('Мост разрушается!')

    fallTimeoutRef.current = setTimeout(() => {
      fallAnimationRef.current = window.setInterval(() => {
        setPlayerY(prev => {
          const newY = prev + 8
          setShakeAmount(prevShake => prevShake + 0.8)

          if (newY >= 250) {
            if (fallAnimationRef.current) {
              clearInterval(fallAnimationRef.current)
              fallAnimationRef.current = null
            }

            clearAllTimeouts()
            handleGameOver()
          }
          return newY
        })
      }, 25)
      fallTimeoutRef.current = null
    }, 1000)
  }

  // ОТСЛЕЖИВАНИЕ БЕГА И РАЗРУШЕНИЯ МОСТА
  useEffect(() => {
    let interval: number | null = null

    if (isResetting) {
      return () => {
        if (interval) clearInterval(interval)
      }
    }

    // БЕГ - быстрое разрушение моста
    if (isMoving && !isShiftHeld && !isFalling && !isPassed && !isGameOver && !isRepairing) {
      interval = setInterval(() => {
        runningTimeRef.current += 0.1

        const damage = 8
        setShakeAmount(prev => Math.min(prev + 0.3, 5))

        setBridgeHealth(prev => {
          const newHealth = Math.max(0, prev - damage)

          if (newHealth < 30 && newHealth > 0) {
            setShowCracks(true)
            setDialogText('МОСТ РУШИТСЯ! ОСТАНОВИСЬ!')
          } else if (newHealth < 60) {
            setShowCracks(true)
            setDialogText('Мост трещит! Сбавь скорость!')
          } else if (newHealth < 80) {
            setShowCracks(true)
            setDialogText('Бег разрушает мост! Иди медленно!')
          }

          if (newHealth < healthThresholdRef.current - 25) {
            checkAndSpendChokopai(newHealth)
          }

          if (newHealth <= 0) {
            resetMovement()
            setShowCracks(true)
            setShakeAmount(5)

            if (chokopai.current > 0) {
              chokopaiFunction()
            } else {
              clearAllTimeouts()
              startFalling()
            }

            if (interval) clearInterval(interval)
            return 0
          }

          return newHealth
        })
      }, 200)
    }
    // СТОИМ
    else {
      if (!isFalling && !isGameOver && !isRepairing && !isPassed && !isResetting) {
        setBridgeHealth(prev => {
          const newHealth = Math.min(100, prev + 0.5)
          if (newHealth > 80) {
            setShowCracks(false)
            setShakeAmount(prev => Math.max(0, prev - 0.1))
            if (dialogTimeoutRef.current) {
              clearTimeout(dialogTimeoutRef.current)
              dialogTimeoutRef.current = null
            }
            dialogTimeoutRef.current = setTimeout(() => {
              setDialogText('')
              dialogTimeoutRef.current = null
            }, 1500)
          }
          return newHealth
        })
      }
      runningTimeRef.current = 0
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isMoving, isShiftHeld, isFalling, isPassed, isGameOver, isRepairing, isResetting])

  // ПРОВЕРКА ПРОХОЖДЕНИЯ МОСТА
  useEffect(() => {
    if (currentScene === 2 && playerX >= 85 && !isPassed && !isFalling && !isGameOver && !isRepairing && !isResetting) {
      setDialogText(
        runningTimeRef.current > 0
          ? 'Ты прошёл, но бежал. Мост мог рухнуть. В следующий раз иди тихо.'
          : 'Молодец! Тихо и аккуратно, как я учил. Вот тебе награда - тихий шаг. Теперь никто тебя не услышит. Ну, кроме меня, конечно. Я всё слышу.'
      )

      setIsPassed(true)
      resetMovement()
      setShowCracks(false)
      setShakeAmount(0)

      setShowArtifact(true)
      obtainArtifact('silent_step')
      setProgress('bridge_passed', true)
      setTimeout(() => setIsShowNextBtn(true), 5000)
    }
  }, [currentScene, playerX, isPassed, isFalling, isGameOver, bridgeHealth, isRepairing, isResetting])

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      clearAllTimeouts()
    }
  }, [])

  const handleContinue = () => {
    setLocation('livingroom')
  }

  const handleArtifactComplete = () => {
    setShowArtifact(false)
  }

  const backgrounds = [bg, bgThree, bgTwo]

  return (
    <GameLayout
      dialogText={dialogText}
      showNextBtn={isShowNextBtn}
      onNext={handleContinue}
    >
      <div className="bridge">
        <img
          className="background"
          src={backgrounds[currentScene]}
          alt="Bridge background"
        />

        <div className="bridge-status">
          <div className="health-bar-container">
            <div className="health-bar-label">Прочность моста: {Math.round(bridgeHealth)}%</div>
            <div className="health-bar">
              <div
                className="health-bar-fill"
                style={{
                  width: `${bridgeHealth}%`,
                  background: bridgeHealth > 60 ? '#4caf50' : bridgeHealth > 30 ? '#ff9800' : '#f44336',
                  transition: 'width 0.3s ease, background 0.3s ease'
                }}
              />
            </div>
          </div>
        </div>

        {showCracks && !isFalling && !isPassed && !isGameOver && !isResetting && (
          <div className="crack-overlay">
            <div className="crack-line" style={{ left: '40%', animationDelay: '0s' }} />
            <div className="crack-line" style={{ left: '48%', animationDelay: '0.2s' }} />
            <div className="crack-line" style={{ left: '56%', animationDelay: '0.4s' }} />
            <div className="crack-line" style={{ left: '64%', animationDelay: '0.6s' }} />
            <div className="crack-line" style={{ left: '72%', animationDelay: '0.8s' }} />
          </div>
        )}

        {isFalling && (
          <>
            <div className="falling-flash" />
            <div className="debris">
              {debrisPieces.map((piece, i) => (
                <div
                  key={i}
                  className="debris-piece"
                  style={{
                    left: `${piece.left}%`,
                    top: `${piece.top}%`,
                    width: `${piece.width}px`,
                    height: `${piece.height}px`,
                    animationDelay: `${piece.delay}s`,
                    transform: `rotate(${piece.rotation}deg)`,
                    animationDuration: `${piece.speed}s`,
                  }}
                />
              ))}
            </div>
            <div className="dust-cloud" />
          </>
        )}

        <div
          className={`player ${isMoving ? 'moving' : ''} ${isFalling ? 'falling' : ''} ${isGameOver ? 'dead' : ''}`}
          style={{
            left: `${playerX}%`,
            bottom: `${isFalling ? 33 - playerY * 0.15 : 33}%`,
            transform: isFalling
              ? `rotate(${playerY * 1.5}deg) scale(${Math.max(0.2, 1 - playerY / 250)})`
              : 'none',
            opacity: isFalling ? Math.max(0, 1 - playerY / 180) : 1,
            pointerEvents: isResetting ? 'none' : 'auto',
          }}
        >
          <img
            src={getPlayerSprite(isMoving, isMovingLeft)}
            alt="Вампир"
            className="player-sprite"
            style={{
              transform: !isMovingLeft && !isFalling && !isGameOver ? 'scaleX(-1)' : 'scaleX(1)',
            }}
          />

          {isFalling && (
            <div className="fall-trails">
              {fallTrails.map((trail, i) => (
                <div
                  key={i}
                  className="fall-trail"
                  style={{
                    left: `${trail.left}%`,
                    animationDelay: `${trail.delay}s`,
                    width: `${trail.width}px`,
                    height: `${trail.height}px`,
                    opacity: trail.opacity,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {isFalling && (
          <div
            className="screen-shake"
            style={{
              transform: `translate(${Math.sin(shakeAmount) * 8}px, ${Math.cos(shakeAmount * 1.3) * 8}px)`
            }}
          />
        )}

        {currentScene === 2 && !isGameOver && !isFalling && !isResetting && (
          <img
            className='cat-cat'
            src={catSprite}
            alt="кошка"
          />
        )}

        <div className="controls-hint">
          ← → или A D - движение | SHIFT - медленный шаг
        </div>

        {isGameOver && (
          <RoundFailOverlay
            title="Мост разрушен!"
            onAction={resetFullTour}
          />
        )}

        {showArtifact && (
          <ArtifactNotification
            artifactName="Тихий шаг"
            artifactIcon={paw}
            onComplete={handleArtifactComplete}
          />
        )}
      </div>
    </GameLayout>
  )
}

function Bridge() {
  const images = [catSprite, bg, bgTwo, bgThree, playerStand, playerLeft, playerRight, paw]

  return (
    <LoadingScreen images={images} minLoadingTime={1000}>
      <BridgeContent />
    </LoadingScreen>
  )
}

export default Bridge