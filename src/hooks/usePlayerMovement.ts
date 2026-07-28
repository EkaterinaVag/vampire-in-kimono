import { useState, useEffect, useRef, useCallback } from 'react'

interface UsePlayerMovementProps {
  initialX?: number
  minX?: number
  maxX?: number
  speed?: number
  shiftSpeed?: number
  scenes?: number
  onSceneChange?: (from: number, to: number) => void
  isEnabled?: boolean
}

interface UsePlayerMovementReturn {
  playerX: number
  setPlayerX: (x: number) => void
  isMoving: boolean
  setIsMoving: (moving: boolean) => void
  isMovingLeft: boolean
  setIsMovingLeft: (left: boolean) => void
  currentScene: number
  setCurrentScene: (scene: number) => void
  isShiftHeld: boolean
  resetMovement: () => void
}

const usePlayerMovement = ({
  initialX = 20,
  minX = 5,
  maxX = 95,
  speed = 1.5,
  shiftSpeed = 0.5,
  scenes = 2,
  onSceneChange,
  isEnabled = true,
}: UsePlayerMovementProps = {}): UsePlayerMovementReturn => {
  const [playerX, setPlayerX] = useState(initialX)
  const [isMoving, setIsMoving] = useState(false)
  const [isMovingLeft, setIsMovingLeft] = useState(false)
  const [currentScene, setCurrentScene] = useState(0)
  const [isShiftHeld, setIsShiftHeld] = useState(false)

  const isTransitioningRef = useRef(false)
  const playerXRef = useRef(playerX)
  const currentSceneRef = useRef(currentScene)

  useEffect(() => {
    playerXRef.current = playerX
  }, [playerX])

  useEffect(() => {
    currentSceneRef.current = currentScene
  }, [currentScene])

  const changeScene = useCallback((from: number, to: number, newX: number) => {
    if (isTransitioningRef.current) return

    isTransitioningRef.current = true
    setCurrentScene(to)
    setPlayerX(newX)
    onSceneChange?.(from, to)

    setTimeout(() => {
      isTransitioningRef.current = false
    }, 100)
  }, [onSceneChange])

  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioningRef.current) return

      // Shift для замедления
      if (e.key === 'Shift') {
        setIsShiftHeld(true)
        return
      }

      // Движение вправо
      if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault()
        setIsMoving(true)
        setIsMovingLeft(false)

        setPlayerX((prev) => {
          const currentSpeed = isShiftHeld ? shiftSpeed : speed
          const newX = Math.min(prev + currentSpeed, maxX)

          // Переход на следующую сцену
          if (newX >= maxX - 5 && currentScene < scenes - 1 && !isTransitioningRef.current) {
            changeScene(currentScene, currentScene + 1, minX + 5)
            return minX + 5
          }
          return newX
        })
      }

      // Движение влево
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault()
        setIsMoving(true)
        setIsMovingLeft(true)

        setPlayerX((prev) => {
          const currentSpeed = isShiftHeld ? shiftSpeed : speed
          const newX = Math.max(prev - currentSpeed, minX)

          // Переход на предыдущую сцену
          if (newX <= minX + 5 && currentScene > 0 && !isTransitioningRef.current) {
            changeScene(currentScene, currentScene - 1, maxX - 5)
            return maxX - 5
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
  }, [isShiftHeld, isEnabled, currentScene, scenes, minX, maxX, speed, shiftSpeed, changeScene])

  const resetMovement = useCallback(() => {
    setIsMoving(false)
    setIsMovingLeft(false)
    // setCurrentScene(0)
  }, [initialX])

  return {
    playerX,
    setPlayerX,
    isMoving,
    setIsMoving,
    isMovingLeft,
    setIsMovingLeft,
    currentScene,
    setCurrentScene,
    isShiftHeld,
    resetMovement,
  }
}

export default usePlayerMovement
