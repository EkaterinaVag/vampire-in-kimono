import { useState, useEffect, useMemo, useRef } from 'react'
import { useGameStore } from '@store/gameStore'
import { GameLayout } from '@components/GameLayout'
import { ArtifactNotification } from '../ui/artifactNotification/ArtifactNotification'
import { LoadingScreen } from '../LoadingScreen'
import usePlayerMovement from '@/hooks/usePlayerMovement'
import getPlayerSprite from '@/utils/playerSprites'
import RoundFailOverlay from '../ui/roundFailOverlay/RoundFailOverlay'
import { useSound } from '@/hooks/useSound'
import './Playground.css'

import bg from '@/assets/backgrounds/playground/playground-1.png'
import bgTwo from '@/assets/backgrounds/playground/playground-2.png'
import playerStand from '@/assets/sprites/player/stand.png'
import playerLeft from '@/assets/sprites/player/left.png'
import playerRight from '@/assets/sprites/player/right.png'
import baby from '@/assets/sprites/children/baby-1.png'
import pill from '@/assets/sprites/children/pill.png'
import cat from '@/assets/sprites/cat/cat-5.png'
import toy from '@/assets/items/artifacts/toy.png'

import childSound from '@/assets/sounds/child.ogg'
import pillSound from '@/assets/sounds/pill.ogg'

function PlaygroundContent() {
  const { setLocation, obtainArtifact, chokopai, spendChokopai, restoreChokopai } = useGameStore()

  const {
    playerX,
    isMoving,
    isMovingLeft,
    currentScene,
    resetMovement
  } = usePlayerMovement()

  const [dialogText, setDialogText] = useState('')
  const [isShowHextBtn, setIsShowHextBtn] = useState(false)
  const [showArtifact, setShowArtifact] = useState(false)

  const [isRoundActive, setIsRoundActive] = useState(true)
  const [showRoundEnd, setShowRoundEnd] = useState(false)

  const [gameTime, setGameTime] = useState(60)
  const [isTimeStopped, setIsTimeStopped] = useState(false)

  const [tablet, setTablet] = useState<{ x: number; y: number; active: boolean } | null>(null)
  const [tabletCaught, setTabletCaught] = useState(false)
  const tabletSpawnedRef = useRef(false)

  const [children, setChildren] = useState<{ x: number; y: number; active: boolean }[]>([])
  const childSpawnRef = useRef<number | null>(null)
  const fallIntervalRef = useRef<number | null>(null)
  const collisionCooldownRef = useRef<number | null>(null)

  const { play: playChildSound } = useSound(childSound)
  const { play: playPillSound } = useSound(pillSound)

  const catPhrases = [
    'Этот мир слишком шумный. Я предпочитаю пакеты. Они шуршат. И в них можно спрятаться от детей. Дети - это страшно. Особенно когда они бегают и орут.',
    'Падающие дети - это всегда смешно',
  ]
  const catPhraseIndexRef = useRef(0)

  const playerXRef = useRef(playerX)
  useEffect(() => {
    playerXRef.current = playerX
  }, [playerX])

  useEffect(() => {
    if (currentScene === 1 && isRoundActive && !tabletCaught && !showRoundEnd) {
      const currentPhrase = catPhrases[catPhraseIndexRef.current % catPhrases.length]
      setDialogText(currentPhrase)
      catPhraseIndexRef.current += 1
    } else {
      setDialogText('')
    }
  }, [currentScene, isRoundActive, tabletCaught, showRoundEnd])

  const showResetRoundOverlay = (message: string) => {
    setIsRoundActive(false)
    setShowRoundEnd(true)
    setDialogText(message)
  }

  const handleResetRound = () => {
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

    setIsRoundActive(true)
    setShowRoundEnd(false)
    setGameTime(60)
    setIsTimeStopped(false)
    setTabletCaught(false)
    setTablet(null)
    setChildren([])
    setDialogText('')
    restoreChokopai()
    resetMovement()
    tabletSpawnedRef.current = false
  }

  const handleChildCollision = () => {
    if (!isRoundActive || tabletCaught) return
    if (collisionCooldownRef.current) return

    collisionCooldownRef.current = setTimeout(() => {
      collisionCooldownRef.current = null
    }, 1000)

    if (chokopai.current > 0) {
      playChildSound({ volume: 0.3 })
      spendChokopai()
      setDialogText(`Ой! Ты потерял чокопай. Осталось: ${chokopai.current}`)

      if (chokopai.current === 0) {
        setTimeout(() => showResetRoundOverlay('Чокопаи закончились! Раунд перезапущен!'), 500)
      }
    } else {
      showResetRoundOverlay('Чокопаи закончились! Раунд перезапущен!')
    }
  }

  useEffect(() => {
    if (isTimeStopped || !isRoundActive) return

    const timer = setInterval(() => {
      setGameTime((prev) => {
        if (prev <= 1) {
          showResetRoundOverlay('Время вышло! Раунд перезапущен!')
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isTimeStopped, isRoundActive])

  const catchTablet = () => {
    if (tabletCaught) return

    playPillSound()
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
      setDialogText('Мя. Ребёнок уронил игрушку. Я подобрал. Держи. Потряси, если страшно. Мне помогает. Но вообще я ничего не боюсь. Кроме пылесоса.')

      setTimeout(() => {
        setShowArtifact(false)
        setDialogText('Дальше кухня. Там тебя ждёт важный выбор. Окрошка или кровь. Или… кое-что ещё. Я бы сказал что, но это испортит сюрприз. А я люблю сюрпризы. Особенно если они шуршат.')
        setIsShowHextBtn(true)
      }, 8000)
    }, 800)
  }

  const currentHour = useMemo(() => {
    const elapsedSeconds = 180 - gameTime
    return elapsedSeconds % 24
  }, [gameTime])

  useEffect(() => {
    if (!isRoundActive || tabletCaught || showRoundEnd) return
    if (tablet && tablet.active) return

    if (currentHour === 17 && !tablet && !tabletSpawnedRef.current) {
      setTablet({
        x: 20 + Math.random() * 60,
        y: -10,
        active: true,
      })
      setDialogText('Таблетка! Нажми E, чтобы поймать!')
    }

    if (currentHour !== 17 || tabletCaught) {
      tabletSpawnedRef.current = false
    }

    if (tablet && !tablet.active) {
      tabletSpawnedRef.current = false
      setTimeout(() => setTablet(null), 500)
    }
  }, [currentHour, tabletCaught, tablet, isRoundActive, showRoundEnd])

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

        return { ...prev, y: newY }
      })
    }, 50)

    return () => clearInterval(tabletFallInterval)
  }, [tablet, tabletCaught, isRoundActive, showRoundEnd])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'e' || e.key === 'E') && tablet && tablet.active && !tabletCaught && isRoundActive) {
        const playerPos = playerX / 100 * window.innerWidth
        const tabletPos = tablet.x / 100 * window.innerWidth
        if (Math.abs(playerPos - tabletPos) < 60) {
          catchTablet()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tablet, tabletCaught, isRoundActive, playerX])

  useEffect(() => {
    if (!isRoundActive || tabletCaught || showRoundEnd) return

    if (childSpawnRef.current) {
      clearInterval(childSpawnRef.current)
      childSpawnRef.current = null
    }

    childSpawnRef.current = window.setInterval(() => {
      const newChild = {
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

      setChildren((prev) => {
        const updated = prev.map((child) => {
          if (!child.active) return child

          const newY = child.y + 1.5

          // Проверка столкновения с игроком
          if (newY > 40 && newY < 55 && !tabletCaught && isRoundActive && !showRoundEnd) {
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

  const handleContinue = () => {
    setLocation('kitchen')
  }

  const handleArtifactComplete = () => {
    setShowArtifact(false)
  }

  const backgrounds = [bg, bgTwo]

  return (
    <GameLayout
      dialogText={dialogText || ''}
      showNextBtn={isShowHextBtn}
      onNext={handleContinue}
    >
      <img
        className="background"
        src={backgrounds[currentScene]}
        alt="Playground background"
      />

      <div
        className={`player-one ${isMoving ? 'moving' : ''}`}
        style={{ left: `${playerX}%` }}
      >
        <img
          src={getPlayerSprite(isMoving, isMovingLeft)}
          alt="Вампир в кимоно"
          style={{ transform: !isMovingLeft ? 'scaleX(-1)' : 'scaleX(1)' }}
        />
      </div>

      <div className="clock-wrapper">
        <div className={`clock-display ${currentHour === 17 ? 'seventeen' : ''}`}>
          <span className="clock-hours">
            {String(currentHour).padStart(2, '0')}:00
          </span>
        </div>

        <div className="progress-label">
          до конца тура {gameTime} сек
        </div>
      </div>

      {children.map((child, id) => (
        <div
          key={id + 1}
          className="child"
          style={{ left: `${child.x}%`, top: `${child.y}%` }}
        >
          <img src={baby} alt="Ребёнок" />
        </div>
      ))}

      {tablet && tablet.active && !tabletCaught && (
        <div
          className="tablet"
          style={{ left: `${tablet.x}%`, top: `${tablet.y}%` }}
        >
          <img src={pill} alt="Таблетка" />
          <span className="tablet-hint">[E]</span>
        </div>
      )}

      {currentScene === 1 && (
        <img
          className='cat-lie'
          src={cat}
          alt="кошка"
        />
      )}

      <div className="controls-hint">
        ← → или A D - движение
      </div>

      {showRoundEnd && (
        <RoundFailOverlay
          title={chokopai?.current === 0 ? 'Раунд проигран!' : 'Время вышло!'}
          onAction={handleResetRound}
        />
      )}

      {showArtifact && (
        <ArtifactNotification
          artifactName="Погремушка забытого детства"
          artifactIcon={toy}
          onComplete={handleArtifactComplete}
        />
      )}
    </GameLayout>
  )
}

function Playground() {
  const images = [bg, bgTwo, playerStand, playerLeft, playerRight, baby, pill, cat, toy]

  return (
    <LoadingScreen images={images} minLoadingTime={1000}>
      <PlaygroundContent />
    </LoadingScreen>
  )
}

export default Playground