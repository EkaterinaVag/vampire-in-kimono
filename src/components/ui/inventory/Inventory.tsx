import { useState } from 'react'
import { useGameStore } from '@store/gameStore'
import './Inventory.css'
import { ResetButton } from '@/components/Reset'

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


export function Inventory() {
  const artifacts = useGameStore((state) => state.artifacts)
  const items = useGameStore(state => state.items)
  const location = useGameStore(state => state.currentLocation)

  const removeItem = useGameStore(state => state.removeItem)
  const consumeRaf = useGameStore(state => state.consumeRaf)

  const [isOpen, setIsOpen] = useState(false)
  const [useMessage, setUseMessage] = useState<string | null>(null)

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
      let message: string

      if (location !== 'moon_field') {
        message = 'Ты уверен, что хочешь съесть его сейчас? Оно тебе ещё пригодится.'
        setUseMessage(message)

        setTimeout(() => {
          setUseMessage(null)
        }, 3000)
      } else {
        message = 'Ты отдал мороженое кошке. Она благодарно мурлычет!'
        removeItem('icecream')
        setUseMessage(message)

        setTimeout(() => {
          setUseMessage(null)
        }, 3000)
      }

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
                <div key={id} className="artifact-item">
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
    </div>
  )
}