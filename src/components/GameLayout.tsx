import type { ReactNode } from 'react'
import { Inventory } from '@/components/ui/inventory/Inventory'
import { Lives } from '@/components/ui/lives/Lives'
import './GameLayout.css'

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

      {/* Постоянные элементы UI */}
      <Lives />
      <Inventory />

      {/* Диалоговое окно */}
      {dialogText && (
        <div className="bg-text">
          <img src="src/assets/backgrounds/text-bg.png" alt="text background" />
          <div className="dialog-text">{dialogText}</div>
        </div>
      )}

      {/* Кнопка ПРОДОЛЖИТЬ */}
      {showNextBtn && onNext && (
        <button className="continue-btn" onClick={onNext}>
          {nextBtnText}
        </button>
      )}
    </div>
  )
}