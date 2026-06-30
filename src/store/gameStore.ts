import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { LocationId, GameStore } from './types'

const initialState = {
  currentLocation: 'prologue' as LocationId,
  prologueShown: false,
  prologueCompleted: false,
  hasCat: false,
  catState: 'idle' as const,
  items: [] as string[],
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // --- ЛОКАЦИЯ ---
      setLocation: (location) => {
        set({ currentLocation: location })
      },

      // --- ПРОЛОГ ---
      setPrologueShown: () => {
        set({ prologueShown: true })
      },

      completePrologue: () => {
        set({
          prologueCompleted: true,
          currentLocation: 'hallway',
          hasCat: true,
        })
      },

      // --- КОТ ---
      setCatState: (state) => {
        set({ catState: state })
      },

      // --- ИНВЕНТАРЬ ---
      addItem: (item) => {
        set((state) => ({
          items: state.items.includes(item) ? state.items : [...state.items, item],
        }))
      },

      hasItem: (item) => {
        return get().items.includes(item)
      },

      // --- СБРОС ---
      reset: () => {
        set(initialState)
        localStorage.removeItem('game-storage')
      },
    }),
    {
      name: 'game-storage',
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        prologueShown: state.prologueShown,
        prologueCompleted: state.prologueCompleted,
        hasCat: state.hasCat,
        catState: state.catState,
        items: state.items,
      }),
    }
  )
)

export default useGameStore
