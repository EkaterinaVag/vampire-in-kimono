import { useState, useEffect, useMemo, useRef } from 'react'
import { useGameStore } from '@store/gameStore'
import { GameLayout } from '@components/GameLayout'
import { ArtifactNotification } from '../ui/artifactNotification/ArtifactNotification'
import './Playground.css'

function Playground() {
  const { setLocation, obtainArtifact, addItem, setProgress, chokopai, useChokopai } = useGameStore()

  const [currentScene, setCurrentScene] = useState(0)
  const [playerX, setPlayerX] = useState(20)
  const [isMoving, setIsMoving] = useState(false)
  const [isMovingLeft, setIsMovingLeft] = useState(false)

  const [dialogText, setDialogText] = useState('')
  const [isShowHextBtn, setIsShowHextBtn] = useState(false)
  const [showArtifact, setShowArtifact] = useState(false)

  const [roundLives, setRoundLives] = useState(3)
  const [isRoundActive, setIsRoundActive] = useState(true)
  const [showRoundEnd, setShowRoundEnd] = useState(false)

  const [gameTime, setGameTime] = useState(180)
  const [isTimeStopped, setIsTimeStopped] = useState(false)

  const [tablet, setTablet] = useState<{ x: number; y: number; active: boolean } | null>(null)
  const [tabletCaught, setTabletCaught] = useState(false)

  const [children, setChildren] = useState<{ id: number; x: number; y: number; active: boolean }[]>([])
  const childIdRef = useRef(0)
  const childSpawnRef = useRef<number | null>(null)
  const fallIntervalRef = useRef<number | null>(null)
  const collisionCooldownRef = useRef<number | null>(null)
  const tabletSpawnedRef = useRef(false)

  const playerXRef = useRef(playerX)
  const tabletCaughtRef = useRef(tabletCaught)
  const isRoundActiveRef = useRef(isRoundActive)
  const showRoundEndRef = useRef(showRoundEnd)

  const useChokopaiRef = useRef(useChokopai)
  const chokopaiRef = useRef(chokopai)

  useEffect(() => {
    playerXRef.current = playerX
  }, [playerX])

  useEffect(() => {
    tabletCaughtRef.current = tabletCaught
  }, [tabletCaught])

  useEffect(() => {
    isRoundActiveRef.current = isRoundActive
  }, [isRoundActive])

  useEffect(() => {
    showRoundEndRef.current = showRoundEnd
  }, [showRoundEnd])

  useEffect(() => {
    useChokopaiRef.current = useChokopai
    chokopaiRef.current = chokopai
  }, [useChokopai, chokopai])

  const resetRound = () => {
    if (childSpawnRef.current) {
      clearInterval(childSpawnRef.current)
      childSpawnRef.current = null
    }
    if (fallIntervalRef.current) {
      clearInterval(fallIntervalRef.current)
      fallIntervalRef.current = null
    }
    if (collisionCooldownRef.current) {
      clearTimeout(collisionCooldownRef.current)
      collisionCooldownRef.current = null
    }

    setRoundLives(3)
    setIsRoundActive(true)
    setShowRoundEnd(false)
    setGameTime(180)
    setIsTimeStopped(false)
    setTabletCaught(false)
    setTablet(null)
    setChildren([])
    setDialogText('')
    tabletSpawnedRef.current = false
  }

  const handleChildCollision = () => {
    if (!isRoundActive || tabletCaught) return
    if (collisionCooldownRef.current) return

    collisionCooldownRef.current = setTimeout(() => {
      collisionCooldownRef.current = null
    }, 1000)

    setRoundLives((prev) => {
      const newLives = prev - 1

      if (newLives <= 0) {
        setIsRoundActive(false)
        setShowRoundEnd(true)
        setDialogText('Раунд проигран! Дети победили! Теряешь чокопай.')

        setIsTimeStopped(true)
        setChildren([])

        if (chokopaiRef.current && chokopaiRef.current.current > 0) {
          useChokopaiRef.current()
        }

        if (childSpawnRef.current) {
          clearInterval(childSpawnRef.current)
          childSpawnRef.current = null
        }
        if (fallIntervalRef.current) {
          clearInterval(fallIntervalRef.current)
          fallIntervalRef.current = null
        }

        return 0
      }

      setDialogText(`Осторожно! Осталось ${newLives} жизней!`)
      setTimeout(() => setDialogText(''), 1500)

      return newLives
    })
  }

  // таймер
  useEffect(() => {
    if (isTimeStopped || !isRoundActive) return

    const timer = setInterval(() => {
      setGameTime((prev) => {
        if (prev <= 1) {
          setIsRoundActive(false)
          setShowRoundEnd(true)
          setDialogText('Время вышло! Раунд перезапущен!')

          setTimeout(() => {
            setShowRoundEnd(false)
            resetRound()
          }, 3000)

          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTimeStopped, isRoundActive])

  const currentHour = useMemo(() => {
    const elapsedSeconds = 180 - gameTime
    return elapsedSeconds % 24
  }, [gameTime])

  // таблетка
  const catchTablet = () => {
    if (tabletCaught) return

    setTabletCaught(true)
    setTablet(null)

    setGameTime(0)
    setIsTimeStopped(true)

    setChildren([])
    if (childSpawnRef.current) {
      clearInterval(childSpawnRef.current)
      childSpawnRef.current = null
    }

    setDialogText('Ты поймал таблетку! Дети исчезли.')

    setTimeout(() => {
      setShowArtifact(true)
      obtainArtifact('rattle')
      addItem('chokopai')
      setDialogText('Мя. Ребёнок уронил игрушку. Я подобрал. Держи. Потряси, если страшно. Мне помогает. Но вообще я ничего не боюсь. Кроме пылесоса.')
      setProgress('playground_tabletCaught', true)

      setTimeout(() => {
        setShowArtifact(false)
        setDialogText('«Дальше - кухня. Там тебя ждёт важный выбор. Окрошка или кровь. Или… кое-что ещё. Я бы сказал что, но это испортит сюрприз. А я люблю сюрпризы. Особенно если они шуршат.')
        setIsShowHextBtn(true)
      }, 6000)
    }, 800)
  }

  useEffect(() => {
    if (!isRoundActive || tabletCaught || showRoundEnd) return
    if (tablet && tablet.active) return

    if (currentHour === 17 && !tablet && !tabletSpawnedRef.current) {
      tabletSpawnedRef.current = true
      setTablet({
        x: 20 + Math.random() * 60,
        y: -10,
        active: true,
      })
      setDialogText('Таблетка! Нажми E, чтобы поймать!')
    }

    if (currentHour !== 17) {
      tabletSpawnedRef.current = false
    }
  }, [currentHour, tabletCaught, tablet, isRoundActive, showRoundEnd])

  useEffect(() => {
    if (tabletCaught) {
      tabletSpawnedRef.current = false
    }
  }, [tabletCaught])

  useEffect(() => {
    if (tablet && !tablet.active) {
      tabletSpawnedRef.current = false
      setTimeout(() => setTablet(null), 500)
    }
  }, [tablet])

  useEffect(() => {
    if (!tablet || !tablet.active || tabletCaught || !isRoundActive || showRoundEnd) return

    const tabletFallInterval = setInterval(() => {
      setTablet((prev) => {
        if (!prev || !prev.active) return prev

        const newY = prev.y + 1.2

        if (newY > 110) {
          setDialogText('Таблетка упала... Ты не успел.')
          setTimeout(() => setDialogText(''), 1500)
          return { ...prev, active: false }
        }

        const playerPos = playerX / 100 * window.innerWidth
        const tabletPos = prev.x / 100 * window.innerWidth

        if (newY > 50 && Math.abs(playerPos - tabletPos) < 50) {
          catchTablet()
          return { ...prev, active: false }
        }

        return { ...prev, y: newY }
      })
    }, 50)

    return () => clearInterval(tabletFallInterval)
  }, [tablet, tabletCaught, isRoundActive, showRoundEnd])

  useEffect(() => {
    if (!isRoundActive || tabletCaught || showRoundEnd) return

    // Очищаем предыдущий интервал
    if (childSpawnRef.current) {
      clearInterval(childSpawnRef.current)
      childSpawnRef.current = null
    }

    // Создаем новый интервал
    childSpawnRef.current = window.setInterval(() => {
      const newChild = {
        id: childIdRef.current++,
        x: 5 + Math.random() * 90,
        y: -10,
        active: true,
      }
      setChildren((prev) => [...prev, newChild])
    }, 1200)

    return () => {
      if (childSpawnRef.current) {
        clearInterval(childSpawnRef.current)
        childSpawnRef.current = null
      }
    }
  }, [tabletCaught, isRoundActive, showRoundEnd])

  useEffect(() => {
    if (!isRoundActive || showRoundEnd) return

    if (fallIntervalRef.current) {
      clearInterval(fallIntervalRef.current)
      fallIntervalRef.current = null
    }

    fallIntervalRef.current = window.setInterval(() => {
      const currentPlayerX = playerXRef.current
      const currentTabletCaught = tabletCaughtRef.current
      const currentIsRoundActive = isRoundActiveRef.current
      const currentShowRoundEnd = showRoundEndRef.current

      setChildren((prev) => {
        const updated = prev.map((child) => {
          if (!child.active) return child

          const newY = child.y + 1.5

          // Проверка столкновения с игроком
          if (newY > 40 && newY < 55 && !currentTabletCaught && currentIsRoundActive && !currentShowRoundEnd) {
            const playerPos = currentPlayerX / 100 * window.innerWidth
            const childPos = child.x / 100 * window.innerWidth

            if (Math.abs(playerPos - childPos) < 50) {
              handleChildCollision()
              return { ...child, active: false }
            }
          }

          if (newY > 110) {
            return { ...child, active: false }
          }
          return { ...child, y: newY }
        })

        return updated.filter((child) => child.active)
      })
    }, 50)

    return () => {
      if (fallIntervalRef.current) {
        clearInterval(fallIntervalRef.current)
        fallIntervalRef.current = null
      }
    }
  }, [isRoundActive, showRoundEnd])

  // движение
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isRoundActive) return // Блокируем движение если раунд не активен

      if (e.key === 'ArrowRight' || e.key === 'd') {
        setIsMoving(true)
        setIsMovingLeft(false)
        setPlayerX((prev) => {
          const newX = Math.min(prev + 2, 95)
          if (newX >= 90 && currentScene === 0) {
            setCurrentScene(1)
            setPlayerX(5)
          }
          return newX
        })
      }
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        setIsMoving(true)
        setIsMovingLeft(true)
        setPlayerX((prev) => {
          const newX = Math.max(prev - 2, 5)
          if (newX <= 10 && currentScene === 1) {
            setCurrentScene(0)
            setPlayerX(95)
          }
          return newX
        })
      }
      if ((e.key === 'e' || e.key === 'E') && tablet && tablet.active && !tabletCaught && isRoundActive) {
        const playerPos = playerX / 100 * window.innerWidth
        const tabletPos = tablet.x / 100 * window.innerWidth
        if (Math.abs(playerPos - tabletPos) < 60) {
          catchTablet()
        }
      }
    }

    const handleKeyUp = () => {
      setIsMoving(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [currentScene, isRoundActive])

  const handleContinue = () => {
    setLocation('kitchen')
  }

  const handleArtifactComplete = () => {
    setShowArtifact(false)
  }

  const backgrounds = [
    'src/assets/backgrounds/playground/playground-1.png',
    'src/assets/backgrounds/playground/playground-2.png',
  ]

  const getPlayerSprite = () => {
    if (!isMoving) {
      return 'src/assets/sprites/player/stand.png'
    }
    if (isMovingLeft) {
      return 'src/assets/sprites/player/left.png'
    }
    return 'src/assets/sprites/player/right.png'
  }

  return (
    <GameLayout
      dialogText={dialogText || ''}
      showNextBtn={isShowHextBtn}
      onNext={handleContinue}
    >
      <div className="playground">
        <img
          className="background"
          src={backgrounds[currentScene]}
          alt="Playground background"
        />

        <div
          className={`player ${isMoving ? 'moving' : ''}`}
          style={{ left: `${playerX}%` }}
        >
          <img
            src={getPlayerSprite()}
            alt="Вампир в кимоно"
            className="player-sprite"
            style={{
              transform: !isMovingLeft ? 'scaleX(-1)' : 'scaleX(1)',
            }}
          />
        </div>

        <div className="clock-wrapper">
          <div className={`clock-display ${currentHour === 17 ? 'seventeen' : ''}`}>
            <span className="clock-hours">
              {String(currentHour).padStart(2, '0')}:00
            </span>
          </div>

          <div className="round-lives">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className={`life-bar ${index < roundLives ? 'active' : 'lost'}`}
              />
            ))}
          </div>

          <div className="progress-label">
            до конца тура {gameTime} сек
          </div>
        </div>

        {showRoundEnd && (
          <div className="round-end-overlay">
            <div className="round-end-message">
              {roundLives === 0 ? 'Раунд проигран!' : 'Время вышло!'}
              <button
                className="round-end-sub"
                onClick={resetRound}
              >
                [ ПЕРЕЗАПУСТИТЬ РАУНД ]
              </button>
            </div>
          </div>
        )}

        {children.map((child) => (
          <div
            key={child.id}
            className="child"
            style={{
              left: `${child.x}%`,
              top: `${child.y}%`,
            }}
          >
            <img
              src="src/assets/sprites/children/baby-1.png"
              alt="Ребёнок"
            />
          </div>
        ))}

        {tablet && tablet.active && !tabletCaught && (
          <div
            className="tablet"
            style={{
              left: `${tablet.x}%`,
              top: `${tablet.y}%`,
            }}
          >
            <span className="tablet-icon">
              <img
                src="src/assets/sprites/children/pill.png"
                alt="Таблетка"
              />
            </span>
            <span className="tablet-hint">[E]</span>
          </div>
        )}

        <div className="controls-hint">
          ← → или A D - движение
        </div>

        {showArtifact && (
          <ArtifactNotification
            artifactName="Погремушка забытого детства"
            artifactIcon="src/assets/items/artifacts/toy.png"
            onComplete={handleArtifactComplete}
          />
        )}
      </div>
    </GameLayout>
  )
}

export default Playground