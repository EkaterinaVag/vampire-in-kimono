import { useGameStore } from '@store/gameStore'
import './Lives.css'

import chok from '@/assets/items/chokopai.png'

export function Lives() {
  const chokopai = useGameStore((state) => state.chokopai)

  return (
    <div className="lives">
      {Array.from({ length: chokopai.max }).map((_, i) => (
        <img
          key={i}
          src={chok}
          alt="Чокопай"
          className={`life-icon ${i >= chokopai.current ? 'empty' : ''}`}
        />
      ))}
    </div>
  )
}