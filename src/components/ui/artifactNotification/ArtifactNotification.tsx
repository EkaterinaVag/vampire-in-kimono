import { useEffect, useState } from 'react'
import './ArtifactNotification.css'

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

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 50)

    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        if (onComplete) onComplete()
      }, 500)
    }, duration)

    return () => clearTimeout(timer)
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