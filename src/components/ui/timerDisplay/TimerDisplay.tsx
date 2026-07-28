import './TimerDisplay.css'

interface TimerDisplayProps {
  timeLeft: number
  icon?: string
  className?: string
}

export function TimerDisplay({ 
  timeLeft,
  icon,
  className = '' 
}: TimerDisplayProps) {
  return (
    <div className={`timer ${className}`}>
        <img 
          src={icon} 
          loading="eager" 
          alt="Таймер" 
          className="timer-icon" 
        />
      <span className="timer-text">{timeLeft}</span>
    </div>
  )
}