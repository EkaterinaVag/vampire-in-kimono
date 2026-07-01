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
  | 'fur_clump'

export type ItemId =
  | 'chokopai'
  | 'icecream'
  | 'raf'

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
  currentLocation: LocationId
  setLocation: (location: LocationId) => void

  prologueCompleted: boolean
  completePrologue: () => void

  hasCat: boolean
  catState: 'idle' | 'eating' | 'offended' | 'running' | 'in_bag' | 'washing'
  setCatState: (state: GameStore['catState']) => void

  items: string[]
  addItem: (item: string) => void
  hasItem: (item: string) => boolean
  removeItem: (item: string) => void

  chokopai: {
    max: 3 | 4
    current: number
  }
  useChokopai: () => void
  addChokopai: () => void
  applyFurClump: () => void

  effects: {
    sleepiness: number // 0–100
  }
  addSleepiness: (value: number) => void
  resetSleepiness: () => void

  reset: () => void
}
