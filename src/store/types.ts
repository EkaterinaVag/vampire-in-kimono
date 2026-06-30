export type LocationId =
  | 'prologue'
  | 'hallway'
  | 'playground'
  | 'kitchen'
  | 'bridge'
  | 'livingroom'
  | 'moon_field'
  | 'final'

export type ArtifactId =
  | 'wisdom_purr'
  | 'rattle'
  | 'heart_in_dill'
  | 'silent_step'

export type ItemId =
  | 'chokopai'
  | 'icecream'
  | 'raf'
  | 'fur_clump'

export interface Artifact {
  id: ArtifactId
  name: string
  description: string
  icon: string
  obtained: boolean
  patienceBonus: number
}

export interface ChokopaiState {
  max: 3 | 4
  current: number
}

export interface GameStore {
  // --- ТЕКУЩАЯ ЛОКАЦИЯ ---
  currentLocation: LocationId
  setLocation: (location: LocationId) => void

  // --- ФЛАГИ ПРОЛОГА ---
  prologueShown: boolean
  prologueCompleted: boolean
  setPrologueShown: () => void
  completePrologue: () => void

  // --- КОТ (пока только для пролога) ---
  hasCat: boolean
  catState: 'idle' | 'eating' | 'offended'
  setCatState: (state: 'idle' | 'eating' | 'offended') => void

  // --- ИНВЕНТАРЬ (пустой, будет расширяться) ---
  items: string[]
  addItem: (item: string) => void
  hasItem: (item: string) => boolean

  // --- СБРОС ---
  reset: () => void
}
