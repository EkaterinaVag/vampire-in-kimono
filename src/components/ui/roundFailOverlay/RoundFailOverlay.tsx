import './RoundFailOverlay.css'

interface RoundFailOverlayProps {
  title: string
  onAction: () => void
}

const RoundFailOverlay = ({
  title,
  onAction
}: RoundFailOverlayProps): React.ReactNode => (
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

export default RoundFailOverlay
