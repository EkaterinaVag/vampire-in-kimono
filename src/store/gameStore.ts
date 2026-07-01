import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { LocationId, GameStore } from './types'

const initialState = {
  currentLocation: 'prologue' as LocationId,
  prologueCompleted: false,
  hasCat: false,
  catState: 'idle' as const,
  items: [] as string[],
  chokopai: { max: 3 as 3 | 4, current: 3 },
  effects: { sleepiness: 0 },
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setLocation: (location) => {
        set({ currentLocation: location })
      },

      completePrologue: () => {
        set({
          prologueCompleted: true,
          currentLocation: 'hallway',
          hasCat: true,
        })
      },

      setCatState: (state) => {
        set({ catState: state })
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
            // съеденный чокопай снижает сонливость
            state.effects.sleepiness = Math.max(0, state.effects.sleepiness - 30)
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

      reset: () => {
        set(initialState)
        localStorage.removeItem('game-storage')
      },
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        prologueCompleted: state.prologueCompleted,
        hasCat: state.hasCat,
        catState: state.catState,
        items: state.items,
        chokopai: state.chokopai,
        effects: { sleepiness: state.effects.sleepiness },
      }),
    }
  )
)

export default useGameStore
