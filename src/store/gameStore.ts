import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { LocationId, GameStore } from './types'

const getInitialState = (): Omit<GameStore,
  'setLocation' | 'completePrologue' | 'setProgress' |
  'addItem' | 'removeItem' | 'hasItem' | 'useChokopai' |
  'addChokopai' | 'applyFurClump' | 'consumeRaf' |
  'addSleepiness' | 'resetSleepiness' | 'obtainArtifact' |
  'hasArtifact' | 'reset'
> => ({
  currentLocation: 'prologue' as LocationId,
  prologueCompleted: false,
  progress: {
    hallway_catSaved: false,
    playground_tabletCaught: false,
    kitchen_choice: null,
    kitchen_icecreamTaken: false,
    kitchen_rafTaken: false,
    kitchen_rafUsed: false,
    bridge_passed: false,
    livingroom_bagCatSaved: false,
    moon_icecreamGiven: false,
    moon_sequenceCompleted: false,
    return_from_final: false
  },
  items: [],
  chokopai: { max: 3 as 3 | 4, current: 3 },
  effects: { sleepiness: 0 },
  artifacts: [],
})

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      setLocation: (location) => {
        set({ currentLocation: location })
      },

      completePrologue: () => {
        set({
          prologueCompleted: true,
          currentLocation: 'hallway',
        })
      },

      setProgress: (key, value) => {
        set((state) => ({
          progress: { ...state.progress, [key]: value },
        }))
      },

      addItem: (item) => {
        set((state) => ({
          items: state.items.includes(item) ? state.items : [...state.items, item],
        }))
      },
      removeItem: (item) => {
        set((state) => ({
          items: state.items.filter((i) => i !== item),
        }))
      },
      hasItem: (item) => {
        return get().items.includes(item)
      },

      useChokopai: () => {
        set((state) => {
          if (state.chokopai.current > 0) {
            state.chokopai.current--
          }
          return state
        })
      },
      addChokopai: () => {
        set((state) => {
          if (state.chokopai.current < state.chokopai.max) {
            state.chokopai.current++
          }
          return state
        })
      },
      applyFurClump: () => {
        set((state) => {
          if (state.chokopai.max === 3) {
            state.chokopai.max = 4
            state.chokopai.current = 4
          }
          return state
        })
      },

      addSleepiness: (value) => {
        set((state) => {
          state.effects.sleepiness = Math.min(100, state.effects.sleepiness + value)
          return state
        })
      },
      resetSleepiness: () => {
        set((state) => {
          state.effects.sleepiness = 0
          return state
        })
      },
      consumeRaf: () => {
        set((state) => {
          state.progress.kitchen_rafUsed = true
          state.effects.sleepiness = 0
          return state
        })
      },

      obtainArtifact: (id) => {
        set((state) => ({
          artifacts: state.artifacts.includes(id) ? state.artifacts : [...state.artifacts, id],
        }))
      },
      hasArtifact: (id) => get().artifacts.includes(id),

      reset: () => {
        set(getInitialState())
        localStorage.removeItem('game-storage')
      },
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        prologueCompleted: state.prologueCompleted,
        progress: state.progress,
        items: state.items,
        chokopai: state.chokopai,
        effects: { sleepiness: state.effects.sleepiness },
        artifacts: state.artifacts,
      }),
    }
  )
)

export default useGameStore
