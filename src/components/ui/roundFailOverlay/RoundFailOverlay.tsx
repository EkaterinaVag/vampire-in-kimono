import { useEffect } from 'react'
import { useSound } from '@/hooks/useSound'
import './RoundFailOverlay.css'

import failSound from '@/assets/sounds/lose.ogg'

interface RoundFailOverlayProps {
  title: string
  onAction: () => void
}

const RoundFailOverlay = ({
  title,
  onAction
}: RoundFailOverlayProps): React.ReactNode => {
  const { play: playFailSound } = useSound(failSound)

  useEffect(() => {
    playFailSound({ volume: 0.1 })
  }, [])

  return (
    <div className="round-fail-overlay">
      <div className="round-fail-message">
        <span className="fail-icon">💥</span>
        <span className="fail-title">{title}</span>
        <button className="fail-btn" onClick={onAction}>
          [ ПЕРЕЗАПУСТИТЬ РАУНД ]
        </button>
      </div>
    </div>
  )
}
export default RoundFailOverlay
