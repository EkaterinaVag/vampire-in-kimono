import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { LocationId, GameStore } from './types'

const getInitialState = (): Omit<GameStore,
  'setLocation' | 'setProgress' |
  'addItem' | 'removeItem' | 'hasItem' | 'spendChokopai' |
  'addChokopai' | 'expandChokopaiSlots' | 'consumeRaf' |
  'addSleepiness' | 'resetSleepiness' | 'obtainArtifact' |
  'hasArtifact' | 'reset' | 'restoreChokopai'
> => ({
  currentLocation: 'prologue' as LocationId,
  progress: {
    kitchen_choice: null,
    kitchen_icecreamTaken: false,
    kitchen_rafTaken: false,
    kitchen_rafUsed: false,
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

      spendChokopai: () => {
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
      expandChokopaiSlots: () => {
        set((state) => {
          if (state.chokopai.max === 3) {
            state.chokopai.max = 4
            state.chokopai.current = 4
          }
          return state
        })
      },
      restoreChokopai: () => {
        set((state) => {
          if (state.chokopai.max === 3) {
            state.chokopai.current = 3
          }

          if (state.chokopai.max === 4) {
            state.chokopai.current = 4
          }
          return state
        })
      },


      addSleepiness: (value: number) => {
        set((state) => {
          const newValue = Math.min(100, Math.max(0, state.effects.sleepiness + value))
          state.effects.sleepiness = newValue
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
          state.items = state.items.filter(item => item !== 'raf')
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
