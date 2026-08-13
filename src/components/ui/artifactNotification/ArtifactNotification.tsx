import { useEffect, useState, useRef } from 'react'
// import { useSound } from '@/hooks/useSound'
import './ArtifactNotification.css'

// import win from '@/assets/sounds/win.ogg'

interface ArtifactNotificationProps {
  artifactName: string
  artifactIcon: string
  onComplete?: () => void
  duration?: number
}

export function ArtifactNotification({
  artifactName,
  artifactIcon,
  onComplete,
  duration = 4000,
}: ArtifactNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  // const { play: playWin } = useSound(win)

  const showTimeoutRef = useRef<number | null>(null)
  const hideTimeoutRef = useRef<number | null>(null)
  const completeTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    showTimeoutRef.current = setTimeout(() => {
      // playWin({ volume: 0.6, loop: false })
      setIsVisible(true)
    }, 50)

    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false)

      completeTimeoutRef.current = setTimeout(() => {
        if (onComplete) onComplete()
      }, 500)
    }, duration)

    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current)
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
      if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current)
    }
  }, [duration, onComplete])

  return (
    <div className={`artifact-overlay ${isVisible ? 'visible' : ''}`}>
      <div className="artifact-content">
        <div className="artifact-icon-wrapper">
          <img src={artifactIcon} alt={artifactName} className="artifact-icon" />
          <div className="sparkles">
            <span className="sparkle sparkle-1">✦</span>
            <span className="sparkle sparkle-2">✦</span>
            <span className="sparkle sparkle-3">✦</span>
            <span className="sparkle sparkle-4">✦</span>
            <span className="sparkle sparkle-5">✦</span>
          </div>
        </div>

        <div className="artifact-name-wrapper">
          <span className="artifact-label">✨ ПОЛУЧЕН АРТЕФАКТ!</span>
          <span className="artifact-name">{artifactName}</span>
        </div>
      </div>
    </div>
  )
}