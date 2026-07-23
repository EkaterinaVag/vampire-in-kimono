import { useGameStore } from '@store/gameStore'

import { useState } from 'react'
import './Reset.css'

export function ResetButton() {
  const reset = useGameStore((state) => state.reset)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleReset = () => {
    reset()
    setShowConfirm(false)
  }

  return (
    <>
      <button
        className='reset-btn'
        onClick={() => setShowConfirm(true)}
      >
        В начало игры
      </button>

      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Вы уверены?</h3>
            <p>Весь прогресс будет потерян. Это действие нельзя отменить.</p>
            <div className="confirm-actions">
              <button
                className="confirm-cancel"
                onClick={() => setShowConfirm(false)}
              >
                Отмена
              </button>
              <button
                className="confirm-reset"
                onClick={handleReset}
              >
                Cбросить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}