import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'

export function Prologue() {
  const {
    prologueShown,
    prologueCompleted,
    setPrologueShown,
    completePrologue,
    setCatState,
  } = useGameStore()

  // Печатающийся текст пролога
  const [displayedText, setDisplayedText] = useState('')
  const fullText = `«Лобные доли сформированы. Ты больше не ребёнок, который убегает от чувств. Бессмертие — не в крови. Бессмертие — в готовности умереть от скуки рядом с ней и воскреснуть от её смеха. Она не отдаст сердце просто так. Вперёд. Кот уже ест наполнитель.»`

  useEffect(() => {
    if (!prologueShown) {
      setPrologueShown()
      // печатаем текст...
      let i = 0
      const timer = setInterval(() => {
        setDisplayedText(fullText.slice(0, i + 1))
        i++
        if (i >= fullText.length) clearInterval(timer)
      }, 30)
      return () => clearInterval(timer)
    }
  }, [])

  const handleStart = () => {
    // кот уже ест наполнитель
    setCatState('eating')
    completePrologue()
  }

  if (prologueCompleted) return null

  return (
    <div className="prologue">
      <div className="moon" />
      <div className="text-container">
        <p className="prologue-text">{displayedText}</p>
      </div>
      {displayedText.length === fullText.length && (
        <button onClick={handleStart} className="start-button">
          [ НАЧАТЬ ]
        </button>
      )}
      <div className="click-hint">[ КЛИКНИ ЛЮБОЙ КЛАВИШЕЙ ]</div>
    </div>
  )
}