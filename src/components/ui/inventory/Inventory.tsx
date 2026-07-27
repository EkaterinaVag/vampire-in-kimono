import { useState } from 'react'
import { useGameStore } from '@store/gameStore'
import { ResetButton } from '@/components/Reset'
import './Inventory.css'

import bag from '@/assets/ui/inventory-bag.png'
import toy from '@/assets/items/artifacts/toy.png'
import purr from '@/assets/items/artifacts/purr.png'
import dill from '@/assets/items/artifacts/dill.png'
import paw from '@/assets/items/artifacts/paw.png'
import furr from '@/assets/items/artifacts/furr.png'
import icecream from '@/assets/items/icecream.png'
import coffee from '@/assets/items/coffee.png'

const ARTIFACT_ICONS: Record<string, string> = {
  wisdom_purr: purr,
  rattle: toy,
  heart_in_dill: dill,
  silent_step: paw,
  fur_clump: furr,
}

const ARTIFACT_NAMES: Record<string, string> = {
  wisdom_purr: 'Мудрое мурчание',
  rattle: 'Погремушка забытого детства',
  heart_in_dill: 'Сердце в укропе',
  silent_step: 'Тихий шаг',
  fur_clump: 'Клок шерсти',
}

const ITEMS_ICONS: Record<string, string> = {
  icecream: icecream,
  raf: coffee,
}

const ITEMS_NAMES: Record<string, string> = {
  icecream: 'Мороженое',
  raf: 'Раф Марципан',
}

const ARTIFACT_METAPHORS: Record<string, { metaphor: string; effect: string }> = {
  wisdom_purr: {
    metaphor: 'Иногда мудрость приходит не из великих книг, а из глупых моментов. Кот, жующий наполнитель - это напоминание, что мир несерьёзен, и это хорошо.',
    effect: 'Кошка слышит мурчание и понимает: ты умеешь слышать других. +15% к доверию в финале',
  },
  rattle: {
    metaphor: 'Детство не должно быть страшным. А если было страшно - значит, сейчас время это отпустить. А еще падающие дети - это смешно',
    effect: 'Кошка слышит звук детства и вспоминает, что когда-то была котёнком. Она перестаёт бояться того, что когда-то было большим и страшным. +10% к доверию в финале',
  },
  heart_in_dill: {
    metaphor: 'Иногда важно выбрать не то, что рационально, а то, что согревает. Даже если это просто миска окрошки.',
    effect: 'Кошка чувствует запах укропа. Она понимает: ты не хищник. Ты - тот, кто пришёл не отнимать, а делить. +25% к доверию в финале',
  },
  silent_step: {
    metaphor: 'На мосту ты шёл медленно. Не потому что боялся - потому что понял: любовь не терпит суеты. Избегающий тип привязанности - это не слабость. Это страх, который проходит, когда ты перестаёшь бежать.',
    effect: 'Кошка не вздрагивает от твоих движений. Она знает: ты не исчезнешь, не дёрнешься, не испугаешься. +20% к доверию в финале',
  },
  fur_clump: {
    metaphor: 'Близость - это быть рядом, даже когда это глупо.',
    effect: 'Кошка чувствует запах кота. Она понимает: ты свой. +10% к доверию в финале',
  },
}

export function Inventory() {
  const artifacts = useGameStore((state) => state.artifacts)
  const items = useGameStore(state => state.items)

  const removeItem = useGameStore(state => state.removeItem)
  const consumeRaf = useGameStore(state => state.consumeRaf)

  const [isOpen, setIsOpen] = useState(false)
  const [useMessage, setUseMessage] = useState<string | null>(null)

  const [selectedArtifact, setSelectedArtifact] = useState<string | null>(null)

  const handleArtifactClick = (id: string) => {
    setSelectedArtifact(id)
  }

  const closeArtifactModal = () => {
    setSelectedArtifact(null)
  }

  const artifactData = selectedArtifact ? ARTIFACT_METAPHORS[selectedArtifact] : null
  const artifactName = selectedArtifact ? ARTIFACT_NAMES[selectedArtifact] : ''
  const artifactIcon = selectedArtifact ? ARTIFACT_ICONS[selectedArtifact] : ''

  const handleUseItem = (itemId: string) => {
    if (itemId === 'raf') {
      consumeRaf()
      removeItem('raf')

      const message = 'Ты выпил раф марципан. Сонливость полностью прошла!'
      setUseMessage(message)

      setTimeout(() => {
        setUseMessage(null)
      }, 3000)

      return
    }

    if (itemId === 'icecream') {
      const message = 'Мороженое нужно отдать кошке на Лунном поле. Используй его там.'
      setUseMessage(message)

      setTimeout(() => {
        setUseMessage(null)
      }, 3000)

      return
    }
  }

  return (
    <div className="inventory-wrapper">
      <button className="inventory-bag" onClick={() => setIsOpen(!isOpen)}>
        <img src={bag} alt="Котомка" />
        {artifacts.length > 0 && (
          <span className="badge">{artifacts.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="inventory-panel">
          {useMessage && (
            <div className="use-message">{useMessage}</div>
          )}

          <h3>Артефакты</h3>
          {artifacts.length === 0 ? (
            <p className="empty-message">Пока ничего нет</p>
          ) : (
            <div className="artifact-grid">
              {artifacts.map((id) => (
                <div
                  key={id}
                  className="artifact-item clickable"
                  onClick={() => handleArtifactClick(id)}
                >
                  <img src={ARTIFACT_ICONS[id]} alt={ARTIFACT_NAMES[id]} />
                  <span>{ARTIFACT_NAMES[id] || id}</span>
                </div>
              ))}
            </div>
          )}

          <h3>Предметы</h3>
          {items.length === 0 ? (
            <p className="empty-message">Пока ничего нет</p>
          ) : (
            <div className="artifact-grid">
              {items.map((id) => {
                const isUsable = id === 'raf' || id === 'icecream'
                return (
                  <div
                    key={id}
                    className={`artifact-item ${isUsable ? 'usable' : ''}`}
                    onClick={() => isUsable && handleUseItem(id)}
                    style={{ cursor: isUsable ? 'pointer' : 'default' }}
                  >
                    <img src={ITEMS_ICONS[id]} alt={ITEMS_NAMES[id]} />
                    <span>{ITEMS_NAMES[id] || id}</span>
                    {isUsable && <span className="use-hint">Применить</span>}
                  </div>
                )
              })}
            </div>
          )}

          <button className="close-inventory" onClick={() => setIsOpen(false)}>
            Закрыть
          </button>

          <ResetButton />
        </div>
      )}

      {selectedArtifact && artifactData && (
        <div className="artifact-modal-overlay" onClick={closeArtifactModal}>
          <div className="artifact-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="artifact-modal-header">
              <img src={artifactIcon} alt={artifactName} className="artifact-modal-icon" />
              <h2>{artifactName}</h2>
              <button className="artifact-modal-close" onClick={closeArtifactModal}>✕</button>
            </div>

            <div className="artifact-modal-body">
              <div className="artifact-metaphor">
                <span className="artifact-label">Метафора</span>
                <p>{artifactData.metaphor}</p>
              </div>

              <div className="artifact-effect">
                <span className="artifact-label">В финале</span>
                <p>{artifactData.effect}</p>
              </div>
            </div>

            <button className="artifact-modal-btn" onClick={closeArtifactModal}>
              Понял
            </button>
          </div>
        </div>
      )}
    </div>
  )
}