import { useEffect, useState, useRef, useCallback } from 'react'
import { useGameStore } from '@store/gameStore'
import './SleepinessVignette.css'

interface SleepinessVignetteProps {
  className?: string
  children?: React.ReactNode
  idleThreshold?: number // секунд бездействия до начисления сонливости (по умолчанию 5)
  idleIncrement?: number // сколько сонливости начислять за каждый цикл (по умолчанию 2)
  checkInterval?: number // интервал проверки в мс (по умолчанию 100)
}

export function SleepinessVignette({
  className = '',
  children,
  idleThreshold = 5,
  idleIncrement = 2,
  checkInterval = 100
}: SleepinessVignetteProps) {
  const { effects, addSleepiness } = useGameStore()
  const [opacity, setOpacity] = useState(0)
  const [idleTime, setIdleTime] = useState(0)

  const inactivityIntervalRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)
  const lastInteractionRef = useRef(Date.now())

  // --- Функция для сброса таймера бездействия ---
  const resetIdleTimer = useCallback(() => {
    setIdleTime(0)
    lastInteractionRef.current = Date.now()
  }, [])

  // --- Функция для остановки таймера ---
  const stopIdleTimer = useCallback(() => {
    if (inactivityIntervalRef.current) {
      clearInterval(inactivityIntervalRef.current)
      inactivityIntervalRef.current = null
    }
  }, [])

  // --- Функция для запуска таймера ---
  const startIdleTimer = useCallback(() => {
    stopIdleTimer()

    inactivityIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return

      const now = Date.now()
      const timeSinceLastInteraction = (now - lastInteractionRef.current) / 1000 // в секундах

      setIdleTime(prev => {
        const newTime = prev + (checkInterval / 1000)

        // Проверяем превышение порога бездействия
        if (newTime >= idleThreshold) {
          // Добавляем сонливость
          addSleepiness(idleIncrement)
          setIdleTime(0) // Сбрасываем счетчик
          lastInteractionRef.current = now // Обновляем время последнего взаимодействия
          return 0
        }

        return newTime
      })
    }, checkInterval)
  }, [checkInterval, idleThreshold, idleIncrement, addSleepiness, stopIdleTimer])

  // --- Отслеживаем взаимодействия пользователя ---
  useEffect(() => {
    const handleInteraction = () => {
      resetIdleTimer()
    }

    // Слушаем все события взаимодействия
    window.addEventListener('click', handleInteraction)
    window.addEventListener('mousemove', handleInteraction)
    window.addEventListener('keydown', handleInteraction)
    window.addEventListener('scroll', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('mousemove', handleInteraction)
      window.removeEventListener('keydown', handleInteraction)
      window.removeEventListener('scroll', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
  }, [resetIdleTimer])

  // --- Управление таймером ---
  useEffect(() => {
    isMountedRef.current = true
    startIdleTimer()

    return () => {
      isMountedRef.current = false
      stopIdleTimer()
    }
  }, [startIdleTimer, stopIdleTimer])

  // --- Обновление прозрачности виньетки ---
  useEffect(() => {
    const newOpacity = Math.min(0.9, (effects.sleepiness / 100) * 0.9)
    setOpacity(newOpacity)
  }, [effects.sleepiness])

  // --- Получение класса для уровня сонливости ---
  const getSleepinessLevelClass = () => {
    const value = effects.sleepiness
    if (value >= 80) return 'level-critical'
    if (value >= 50) return 'level-high'
    if (value >= 25) return 'level-medium'
    return 'level-low'
  }

  // Показываем виньетку только если сонливость > 10%
  if (effects.sleepiness < 10) {
    return <>{children}</>
  }

  return (
    <div className={`sleepiness-vignette-wrapper ${className} ${getSleepinessLevelClass()}`}>
      {children}
      <div
        className="sleepiness-vignette-overlay"
        style={{
          opacity: opacity,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />
    </div>
  )
}