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

  progress: {
    hallway_catSaved: boolean
    playground_tabletCaught: boolean

    kitchen_choice: 'okroshka' | 'blood' | null
    kitchen_icecreamTaken: boolean
    kitchen_rafTaken: boolean

    bridge_passed: boolean

    livingroom_bagCatSaved: boolean
    moon_icecreamGiven: boolean
    moon_sequenceCompleted: boolean
  }

  setProgress: <K extends keyof GameStore['progress']>(
    key: K,
    value: GameStore['progress'][K]
  ) => void

  items: string[]
  addItem: (item: string) => void
  removeItem: (item: string) => void
  hasItem: (item: string) => boolean

  chokopai: { max: 3 | 4; current: number }
  useChokopai: () => void
  addChokopai: () => void
  applyFurClump: () => void

  effects: { sleepiness: number }
  addSleepiness: (value: number) => void
  resetSleepiness: () => void

  artifacts: string[]
  obtainArtifact: (id: string) => void
  hasArtifact: (id: string) => boolean

  reset: () => void
}
