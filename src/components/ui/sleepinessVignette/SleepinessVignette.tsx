import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useGameStore } from '@store/gameStore'
import './SleepinessVignette.css'

interface SleepinessVignetteProps {
  children?: React.ReactNode
  idleThreshold?: number // секунд бездействия до начисления сонливости
  idleIncrement?: number // сколько сонливости начислять за каждый цикл
  checkInterval?: number // интервал проверки в мс
}

export function SleepinessVignette({
  children,
  idleThreshold = 5,
  idleIncrement = 10,
  checkInterval = 100
}: SleepinessVignetteProps) {
  const { addSleepiness, resetSleepiness } = useGameStore()
  const sleepiness = useGameStore((state) => state.effects.sleepiness)
  const isRafUsed = useGameStore(state => state.progress.kitchen_rafUsed)

  const [, forceUpdate] = useState({})

  const inactivityIntervalRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)
  const idleTimeRef = useRef(0)

  // Функция для остановки таймера
  const stopIdleTimer = useCallback(() => {
    if (inactivityIntervalRef.current) {
      clearInterval(inactivityIntervalRef.current)
      inactivityIntervalRef.current = null
    }
    idleTimeRef.current = 0
  }, [])

  // Функция для запуска таймера
  const startIdleTimer = useCallback(() => {
    if (isRafUsed) {
      stopIdleTimer()
      return
    }

    stopIdleTimer()

    inactivityIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current) return

      idleTimeRef.current += checkInterval / 1000

      if (idleTimeRef.current >= idleThreshold) {
        addSleepiness(idleIncrement)
        idleTimeRef.current = 0
        forceUpdate({})
      }
    }, checkInterval)
  }, [checkInterval, idleThreshold, idleIncrement, addSleepiness, stopIdleTimer, isRafUsed])

  // Управление таймером
  useEffect(() => {
    isMountedRef.current = true
    idleTimeRef.current = 0
    startIdleTimer()

    return () => {
      isMountedRef.current = false
      stopIdleTimer()
    }
  }, [startIdleTimer, stopIdleTimer])

  useEffect(() => {
    if (isRafUsed) {
      stopIdleTimer()
      resetSleepiness()
      idleTimeRef.current = 0
    } else {
      idleTimeRef.current = 0
      startIdleTimer()
    }
  }, [isRafUsed, stopIdleTimer, startIdleTimer, resetSleepiness])

  // Обновление прозрачности виньетки
  const getSleepinessLevelClass = useMemo(() => {
    if (sleepiness >= 80) return 'level-critical'
    if (sleepiness >= 50) return 'level-high'
    if (sleepiness >= 25) return 'level-medium'
    return 'level-low'
  }, [sleepiness])

  // Показываем виньетку только если сонливость > 10%
  if (sleepiness < 10 || isRafUsed) {
    return <>{children}</>
  }

  return (
    <div className={`sleepiness-vignette-wrapper ${getSleepinessLevelClass}`}>
      {children}
      <div className="sleepiness-vignette-overlay"></div>
    </div>
  )
}