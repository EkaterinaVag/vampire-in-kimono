export type LocationId =
  | 'prologue'
  | 'hallway'
  | 'playground'
  | 'kitchen'
  | 'bridge'
  | 'livingroom'
  | 'moon_field'

export type ArtifactId =
  | 'wisdom_purr'
  | 'rattle'
  | 'heart_in_dill'
  | 'silent_step'
  | 'fur_clump'

export type ItemId =
  | 'icecream'
  | 'raf'

export interface ChokopaiState {
  max: 3 | 4
  current: number
}

export interface GameStore {
  currentLocation: LocationId
  setLocation: (location: LocationId) => void

  progress: {
    kitchen_choice: 'okroshka' | 'blood' | null
    kitchen_icecreamTaken: boolean
    kitchen_rafTaken: boolean
    kitchen_rafUsed: boolean,
    return_from_final: boolean
  }

  setProgress: <K extends keyof GameStore['progress']>(
    key: K,
    value: GameStore['progress'][K]
  ) => void

  items: ItemId[]
  addItem: (item: ItemId) => void
  removeItem: (item: ItemId) => void
  hasItem: (item: ItemId) => boolean

  chokopai: ChokopaiState
  spendChokopai: () => void
  addChokopai: () => void
  expandChokopaiSlots: () => void
  restoreChokopai: () => void

  consumeRaf: () => void

  effects: { sleepiness: number }
  addSleepiness: (value: number) => void
  resetSleepiness: () => void

  artifacts: ArtifactId[]
  obtainArtifact: (id: ArtifactId) => void
  hasArtifact: (id: ArtifactId) => boolean

  reset: () => void
}
