import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useGameStore } from '@store/gameStore'
import './SleepinessVignette.css'

// TODO: порефакторить ошибка. пока работает

interface SleepinessVignetteProps {
  children?: React.ReactNode
  idleThreshold?: number // секунд бездействия до начисления сонливости (по умолчанию 5)
  idleIncrement?: number // сколько сонливости начислять за каждый цикл (по умолчанию 2)
  checkInterval?: number // интервал проверки в мс (по умолчанию 100)
}

export function SleepinessVignette({
  children,
  idleThreshold = 5,
  idleIncrement = 10,
  checkInterval = 100
}: SleepinessVignetteProps) {
  const { effects, addSleepiness, resetSleepiness } = useGameStore()
  const isRafUsed = useGameStore(state => state.progress.kitchen_rafUsed)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [idleTime, setIdleTime] = useState(0)

  const inactivityIntervalRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)
  // eslint-disable-next-line react-hooks/purity
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
    if (isRafUsed) {
      stopIdleTimer()
      return
    }

    stopIdleTimer()

    inactivityIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return

      const now = Date.now()
      // const timeSinceLastInteraction = (now - lastInteractionRef.current) / 1000 // в секундах

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
    handleInteraction()
  }, [resetIdleTimer])

  // --- Управление таймером ---
  useEffect(() => {
    isMountedRef.current = true
    // Инициализируем время последнего взаимодействия здесь, вне рендера
    lastInteractionRef.current = Date.now()
    startIdleTimer()

    return () => {
      isMountedRef.current = false
      stopIdleTimer()
    }
  }, [startIdleTimer, stopIdleTimer])

  // --- Перезапускаем таймер при изменении isRafUsed ---
  useEffect(() => {
    if (isRafUsed) {
      // Если RAF выпит - останавливаем таймер и сбрасываем сонливость
      stopIdleTimer()
      resetSleepiness()
    } else {
      // Если RAF не выпит - запускаем таймер заново
      startIdleTimer()
    }
  }, [isRafUsed, stopIdleTimer, startIdleTimer, resetSleepiness])

  // --- Обновление прозрачности виньетки ---
  const getSleepinessLevelClass = useMemo(() => {
    const value = effects.sleepiness
    if (value >= 80) return 'level-critical'
    if (value >= 50) return 'level-high'
    if (value >= 25) return 'level-medium'
    return 'level-low'
  }, [effects.sleepiness])

  // Показываем виньетку только если сонливость > 10%
  if (effects.sleepiness < 10 || isRafUsed) {
    return <>{children}</>
  }

  return (
    <div className={`sleepiness-vignette-wrapper ${getSleepinessLevelClass}`}>
      {children}
      <div className="sleepiness-vignette-overlay"></div>
    </div>
  )
}