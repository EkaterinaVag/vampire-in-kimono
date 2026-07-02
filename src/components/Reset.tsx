import { useGameStore } from '@store/gameStore'

export function ResetButton() {
  const reset = useGameStore((state) => state.reset)
  return <button onClick={reset}>Сбросить прогресс</button>
}