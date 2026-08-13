import type { ReactNode } from 'react'
import { Inventory } from '@/components/ui/inventory/Inventory'
import { Lives } from '@/components/ui/lives/Lives'
import './GameLayout.css'

import bg from '@/assets/backgrounds/text-bg.png'

interface GameLayoutProps {
  children: ReactNode
  dialogText?: string
  showNextBtn?: boolean
  onNext?: () => void
  nextBtnText?: string
}

export function GameLayout({
  children,
  dialogText,
  showNextBtn = false,
  onNext,
  nextBtnText = '[ ПРОДОЛЖИТЬ ➜ ]',
}: GameLayoutProps) {
  return (
    <div className="game-layout">
      <div className="game-world">{children}</div>

      <Lives />
      <Inventory />

      {dialogText && (
        <div className="bg-text">
          <img src={bg} alt="text background" />
          <div className="dialog-text">{dialogText}</div>
        </div>
      )}

      {onNext && (
        <button className={`continue-btn ${showNextBtn ? 'visible' : 'hidden'}`} onClick={onNext}>
          {nextBtnText}
        </button>
      )}
    </div>
  )
}