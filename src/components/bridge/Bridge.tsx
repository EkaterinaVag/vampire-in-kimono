import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '@store/gameStore'
import { GameLayout } from '@components/GameLayout'
import { ArtifactNotification } from '../ui/artifactNotification/ArtifactNotification'
import './Bridge.css'

import catSprite from '@/assets/sprites/cat/cat-9.png'
import bg from '@/assets/backgrounds/bridge/bridge-1.jpg'
import bgTwo from '@/assets/backgrounds/bridge/bridge-2.jpg'
import playerStand from '@/assets/sprites/player/stand.png'
import playerLeft from '@/assets/sprites/player/left.png'
import playerRight from '@/assets/sprites/player/right.png'
import paw from '@/assets/items/artifacts/paw.png'

function Bridge() {
  const {
    setProgress,
    setLocation,
    obtainArtifact,
    useChokopai: chokopaiFunction,
  } = useGameStore()

  const [currentScene, setCurrentScene] = useState(0)
  const [playerX, setPlayerX] = useState(40)
  const [playerY, setPlayerY] = useState(0)
  const [isMoving, setIsMoving] = useState(false)
  const [isMovingLeft, setIsMovingLeft] = useState(false)
  const [isShiftHeld, setIsShiftHeld] = useState(false)
  const [isFalling, setIsFalling] = useState(false)

  const [dialogText, setDialogText] = useState('')
  const [isShowNextBtn, setIsShowNextBtn] = useState(false)
  const [showArtifact, setShowArtifact] = useState(false)

  const [attempts, setAttempts] = useState(0)
  const [isPassed, setIsPassed] = useState(false)
  const [showCracks, setShowCracks] = useState(false)
  const [shakeAmount, setShakeAmount] = useState(0)

  const fallAnimationRef = useRef<number | null>(null)
  const runningTimeRef = useRef<number>(0)

  // ГЕНЕРАЦИЯ СЛУЧАЙНЫХ ЗНАЧЕНИЙ ДЛЯ ОБЛОМКОВ
  const [debrisPieces] = useState(() => {
    return [...Array(15)].map(() => ({
      left: 20 + Math.random() * 60,
      top: 20 + Math.random() * 40,
      width: 5 + Math.random() * 15,
      height: 5 + Math.random() * 15,
      delay: Math.random() * 0.5,
      rotation: Math.random() * 360,
    }))
  })

  // ГЕНЕРАЦИЯ СЛЕДОВ ПАДЕНИЯ
  const [fallTrails] = useState(() => {
    return [...Array(8)].map(() => ({
      left: -30 + Math.random() * 60,
      delay: Math.random() * 0.5,
      width: 3 + Math.random() * 6,
      height: 10 + Math.random() * 20,
    }))
  })

  // СБРОС МОСТА
  const resetBridge = () => {
    setPlayerX(40)
    setCurrentScene(0)
    runningTimeRef.current = 0
    setShowCracks(false)
    setShakeAmount(0)
    setAttempts((prev) => prev + 1)
    setDialogText('')

    if (attempts >= 2) {
      const failMessages = [
        'Мя. Провалился. Быстро бежал. А куда? Мост - это не спринт. Попробуй ещё раз. Я подожду. Мне некуда спешить.',
        'Ну вот, опять. Ты там что, марафонец? Мост, блин, а не беговая дорожка.',
        'Пф... Ну ты и торопыга! Мост от твоего бега аж зашатался. Медленнее, медленнее, я не хочу ловить тебя внизу.',
        'Я начинаю думать, что ты это специально делаешь. Просто чтобы на меня впечатление произвести. Ну, впечатлён. Теперь иди нормально.'
      ]
      setDialogText(failMessages[Math.floor(Math.random() * failMessages.length)])
      setTimeout(() => setDialogText(''), 3000)
    }
  }

  // АНИМАЦИЯ ПАДЕНИЯ
  const startFalling = () => {
    setIsFalling(true)
    setPlayerY(0)
    setShakeAmount(0)
    setShowCracks(false)

    if (fallAnimationRef.current) {
      clearInterval(fallAnimationRef.current)
      fallAnimationRef.current = null
    }

    fallAnimationRef.current = window.setInterval(() => {
      setPlayerY(prev => {
        const newY = prev + 5
        setShakeAmount(prevShake => prevShake + 0.3)

        if (newY >= 150) {
          if (fallAnimationRef.current) {
            clearInterval(fallAnimationRef.current)
            fallAnimationRef.current = null
          }
          setTimeout(() => {
            resetBridge()
            setIsFalling(false)
            setPlayerY(0)
          }, 500)
        }
        return newY
      })
    }, 40)
  }

  // ОТСЛЕЖИВАНИЕ ВРЕМЕНИ БЕГА
  useEffect(() => {
    let interval: number | null = null

    // Только если игрок бежит (двигается без Shift) и не падает
    if (isMoving && !isShiftHeld && !isFalling && !isPassed) {
      interval = setInterval(() => {
        // Накопление времени бега
        runningTimeRef.current += 0.1

        if (runningTimeRef.current >= 0.5 && runningTimeRef.current < 1) {
          setDialogText('Доски трещат! Иди медленнее...')
          setTimeout(() => setDialogText(''), 2000)
          setShowCracks(true)
        }

        if (runningTimeRef.current >= 1) {
          setDialogText('Мост провалился!')
          setTimeout(() => setDialogText(''), 2000)
          chokopaiFunction()
          startFalling()
          if (interval) clearInterval(interval)
        }
      }, 100)
    } else {
      // Если игрок остановился или перешел на тихую ходьбу - обнуляем таймер
      if (runningTimeRef.current > 0) {
        runningTimeRef.current = 0
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isMoving, isShiftHeld, isFalling, isPassed])

  // ДВИЖЕНИЕ ИГРОКА
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPassed || isShowNextBtn || isFalling) return

      if (e.key === 'Shift') {
        setIsShiftHeld(true)
        return
      }

      if (e.key === 'ArrowRight' || e.key === 'd') {
        setIsMoving(true)
        setIsMovingLeft(false)
        setPlayerX((prev) => {
          const speed = isShiftHeld ? 0.5 : 1.5
          const newX = Math.min(prev + speed, 95)

          if (newX >= 85 && currentScene === 0) {
            setCurrentScene(1)
            setPlayerX(10)
          }
          return newX
        })
      }

      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setIsMoving(true)
        setIsMovingLeft(true)
        setPlayerX((prev) => {
          const speed = isShiftHeld ? 0.5 : 1.5
          const newX = Math.max(prev - speed, 5)
          if (newX <= 10 && currentScene === 1) {
            setCurrentScene(0)
            setPlayerX(90)
          }
          return newX
        })
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftHeld(false)
        return
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') {
        setIsMoving(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isShiftHeld, isPassed, isShowNextBtn, currentScene, isFalling])

  // ПРОВЕРКА ПРОХОЖДЕНИЯ МОСТА
  useEffect(() => {
    if (currentScene === 1 && playerX >= 80 && !isPassed && !isFalling) {
      setDialogText(
        runningTimeRef.current > 0
          ? 'Ты прошёл, но бежал. Мост мог рухнуть. В следующий раз иди тихо.'
          : 'Молодец! Тихо и аккуратно, как я учил. Вот тебе награда - тихий шаг. Теперь никто тебя не услышит. Ну, кроме меня, конечно. Я всё слышу.'
      )
      setIsPassed(true)
      setShowArtifact(true)
      obtainArtifact('silent_step')
      setProgress('bridge_passed', true)
      setTimeout(() => setIsShowNextBtn(true), 5000)
    }
  }, [currentScene, playerX, isPassed, isFalling])

  useEffect(() => {
    setTimeout(() => {
      setDialogText('Мя. Долго же ты. Мост... Ну, давай, иди. Я тут посижу, подожду. Можешь не спешить. Я вообще никуда не тороплюсь. Мне и тут хорошо.')
    }, 300)
  }, [])

  // ПЕРЕХОД
  const handleContinue = () => {
    setLocation('livingroom')
  }

  const handleArtifactComplete = () => {
    setShowArtifact(false)
  }

  const backgrounds = [
    bg,
    bgTwo,
  ]

  return (
    <GameLayout
      dialogText={dialogText}
      showNextBtn={isShowNextBtn}
      onNext={handleContinue}
    >
      <div className="bridge">
        <img
          rel="preload"
          className="background"
          src={backgrounds[currentScene]}
          alt="Bridge background"
        />

        {showCracks && !isFalling && !isPassed && (
          <div className="crack-overlay">
            <div className="crack-line" style={{ left: '50%', animationDelay: '0s' }}></div>
            <div className="crack-line" style={{ left: '58%', animationDelay: '0.3s' }}></div>
            <div className="crack-line" style={{ left: '65%', animationDelay: '0.6s' }}></div>
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
                  }}
                />
              ))}
            </div>
            <div className="dust-cloud" />
          </>
        )}

        <div
          className={`player ${isMoving ? 'moving' : ''} ${isFalling ? 'falling' : ''}`}
          style={{
            left: `${playerX}%`,
            bottom: `${isFalling ? 35 - playerY * 0.15 : 35}%`,
            transform: isFalling
              ? `rotate(${playerY * 1.5}deg) scale(${Math.max(0.3, 1 - playerY / 200)})`
              : 'none',
            opacity: isFalling ? Math.max(0, 1 - playerY / 150) : 1,
          }}
        >
          <img
            src={getPlayerSprite(isMoving, isMovingLeft)}
            alt="Вампир"
            className="player-sprite"
            style={{
              transform: !isMovingLeft && !isFalling ? 'scaleX(-1)' : 'scaleX(1)',
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
              transform: `translate(${Math.sin(shakeAmount) * 5}px, ${Math.cos(shakeAmount * 1.3) * 5}px)`
            }}
          />
        )}

        {currentScene === 1 && (
          <img
            className='cat-cat'
            src={catSprite}
            alt="кошка"
          />
        )}

        <div className="controls-hint">
          ← → или A D - движение | SHIFT - медленный шаг
        </div>

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

function getPlayerSprite(isMoving: boolean, isMovingLeft: boolean) {
  if (!isMoving) return playerStand
  if (isMovingLeft) return playerLeft
  return playerRight
}

export default Bridge
