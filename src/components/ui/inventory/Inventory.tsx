import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useGameStore } from '@store/gameStore'
import { useSound } from '@/hooks/useSound'
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

import bagOpenSound from '@/assets/sounds/bag-open.ogg'
import bagCloseSound from '@/assets/sounds/bag-close.ogg'
import openDescription from '@/assets/sounds/openDescription.ogg'
import closeDescription from '@/assets/sounds/closeDescription.ogg'
import useItem from '@/assets/sounds/useItem.ogg'

import type { ArtifactId, ItemId } from '@store/types.ts'

const ARTIFACT_DATA: Record<ArtifactId, {
  name: string
  icon: string
  metaphor: string
  effect: string
}> = {
  wisdom_purr: {
    name: 'Мудрое мурчание',
    icon: purr,
    metaphor: 'Иногда мудрость приходит не из великих книг, а из глупых моментов. Кот, жующий наполнитель - это напоминание, что мир несерьёзен, и это хорошо.',
    effect: 'Кошка слышит мурчание и понимает: ты умеешь слышать других. +15% к доверию в финале',
  },
  rattle: {
    name: 'Погремушка забытого детства',
    icon: toy,
    metaphor: 'Детство не должно быть страшным. А если было страшно - значит, сейчас время это отпустить. А еще падающие дети - это смешно',
    effect: 'Кошка слышит звук детства и вспоминает, что когда-то была котёнком. Она перестаёт бояться того, что когда-то было большим и страшным. +10% к доверию в финале',
  },
  heart_in_dill: {
    name: 'Сердце в укропе',
    icon: dill,
    metaphor: 'Иногда важно выбрать не то, что рационально, а то, что согревает. Даже если это просто миска окрошки. Холодная, но согревает',
    effect: 'Кошка чувствует запах укропа. Она понимает: ты не хищник. Ты - тот, кто пришёл не отнимать, а делить. +25% к доверию в финале',
  },
  silent_step: {
    name: 'Тихий шаг',
    icon: paw,
    metaphor: 'На мосту ты шёл медленно. Не потому что боялся - потому что понял: любовь не терпит суеты. Избегающий тип привязанности - это не слабость. Это страх, который проходит, когда ты перестаёшь бежать.',
    effect: 'Кошка не вздрагивает от твоих движений. Она знает: ты не исчезнешь, не дёрнешься, не испугаешься. +20% к доверию в финале',
  },
  fur_clump: {
    name: 'Клок шерсти',
    icon: furr,
    metaphor: 'Близость - это быть рядом, даже когда это глупо.',
    effect: 'Кошка чувствует запах кота. Она понимает: ты свой. +10% к доверию в финале',
  },
}

const ITEMS_DATA: Record<ItemId, {
  name: string
  icon: string
}> = {
  icecream: {
    name: 'Мороженое',
    icon: icecream,
  },
  raf: {
    name: 'Раф Марципан',
    icon: coffee,
  },
}

export function Inventory() {
  const { artifacts, items, consumeRaf } = useGameStore()

  const [isOpen, setIsOpen] = useState(false)
  const [useMessage, setUseMessage] = useState<string | null>(null)
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactId | null>(null)

  const timeoutRef = useRef<number | null>(null)

  const { play: playBagOpen } = useSound(bagOpenSound)
  const { play: playBagClose } = useSound(bagCloseSound)
  const { play: playShowDes } = useSound(openDescription)
  const { play: playCloseDes } = useSound(closeDescription)
  const { play: playUseItem } = useSound(useItem)

  const handleArtifactClick = (id: ArtifactId) => {
    setSelectedArtifact(id)
    playShowDes({ volume: 0.5 })
  }

  const closeArtifactModal = () => {
    setSelectedArtifact(null)
    playCloseDes({ volume: 0.5 })
  }

  const artifactData = selectedArtifact ? ARTIFACT_DATA[selectedArtifact] : null

  const handleUseItem = (itemId: ItemId) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (itemId === 'raf') {
      playUseItem()
      consumeRaf()

      const message = 'Ты выпил раф марципан. Сонливость полностью прошла!'
      setUseMessage(message)

      timeoutRef.current = setTimeout(() => {
        setUseMessage(null)
      }, 3000)

      return
    }

    if (itemId === 'icecream') {
      const message = 'Мороженое нужно отдать кошке на Лунном поле. Используй его там.'
      setUseMessage(message)

      timeoutRef.current = setTimeout(() => {
        setUseMessage(null)
      }, 3000)

      return
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const toggleInventory = () => {
    const newState = !isOpen
    setIsOpen(newState)

    if (newState) {
      playBagOpen({ volume: 0.3 })
    } else {
      playBagClose({ volume: 0.3 })
    }
  }

  const handleCloseInventory = () => {
    setIsOpen(false)
    playBagClose({ volume: 0.3 })
  }

  return (
    <div className="inventory-wrapper">
      <button className="inventory-bag" onClick={toggleInventory}>
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
              {artifacts.map((id) => {
                const data = ARTIFACT_DATA[id]
                return (
                  <div
                    key={id}
                    className="artifact-item clickable"
                    onClick={() => handleArtifactClick(id)}
                  >
                    <img src={data.icon} alt={data.name} />
                    <span>{data.name}</span>
                  </div>
                )
              })}
            </div>
          )}

          <h3>Предметы</h3>
          {items.length === 0 ? (
            <p className="empty-message">Пока ничего нет</p>
          ) : (
            <div className="artifact-grid">
              {items.map((id) => {
                const data = ITEMS_DATA[id]
                const isUsable = id === 'raf' || id === 'icecream'
                return (
                  <div
                    key={id}
                    className={`artifact-item ${isUsable ? 'usable' : ''}`}
                    onClick={() => isUsable && handleUseItem(id)}
                    style={{ cursor: isUsable ? 'pointer' : 'default' }}
                  >
                    <img src={data.icon} alt={data.name} />
                    <span>{data.name}</span>
                    {isUsable && <span className="use-hint">Применить</span>}
                  </div>
                )
              })}
            </div>
          )}

          <button className="close-inventory"
            onClick={handleCloseInventory}>
            Закрыть
          </button>

          <ResetButton />
        </div>
      )}

      {selectedArtifact && artifactData && createPortal(
        <div className="artifact-modal-overlay" onClick={closeArtifactModal}>
          <div className="artifact-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="artifact-modal-header">
              <img src={artifactData.icon} alt={artifactData.name} className="artifact-modal-icon" />
              <h2>{artifactData.name}</h2>
              <button className="artifact-modal-close" onClick={closeArtifactModal}>✕</button>
            </div>

            <div className="artifact-modal-body">
              <div className="artifact-metaphor">
                <span className="artifact-label-m">Метафора</span>
                <p>{artifactData.metaphor}</p>
              </div>

              <div className="artifact-effect">
                <span className="artifact-label-m">В финале</span>
                <p>{artifactData.effect}</p>
              </div>
            </div>

            <button className="artifact-modal-btn" onClick={closeArtifactModal}>
              Понял
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}