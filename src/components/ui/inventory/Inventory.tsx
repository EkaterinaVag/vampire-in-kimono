import { useState } from 'react'
import { useGameStore } from '@store/gameStore'
import './Inventory.css'

const ARTIFACT_ICONS: Record<string, string> = {
  wisdom_purr: 'src/assets/items/artifacts/purr.png',
  rattle: 'src/assets/items/artifacts/toy.png',
  heart_in_dill: 'src/assets/items/artifacts/dill.png',
  silent_step: 'src/assets/items/artifacts/paw.png',
  fur_clump: 'src/assets/items/artifacts/furr.png',
}

const ARTIFACT_NAMES: Record<string, string> = {
  wisdom_purr: 'Мудрое мурчание',
  rattle: 'Детская погремушка',
  heart_in_dill: 'Сердце в укропе',
  silent_step: 'Тихий шаг',
  fur_clump: 'Клок шерсти',
}

export function Inventory() {
  const artifacts = useGameStore((state) => state.artifacts)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="inventory-wrapper">
      <button className="inventory-bag" onClick={() => setIsOpen(!isOpen)}>
        <img src="src/assets/ui/inventory-bag.png" alt="Котомка" />
        {artifacts.length > 0 && (
          <span className="badge">{artifacts.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="inventory-panel">
          <h3>Артефакты</h3>
          {artifacts.length === 0 ? (
            <p className="empty-message">Пока ничего нет</p>
          ) : (
            <div className="artifact-grid">
              {artifacts.map((id) => (
                <div key={id} className="artifact-item">
                  <img src={ARTIFACT_ICONS[id]} alt={ARTIFACT_NAMES[id]} />
                  <span>{ARTIFACT_NAMES[id] || id}</span>
                </div>
              ))}
            </div>
          )}
          <button className="close-inventory" onClick={() => setIsOpen(false)}>
            Закрыть
          </button>
        </div>
      )}
    </div>
  )
}