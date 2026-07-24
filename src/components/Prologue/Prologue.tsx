import { useEffect, useState } from 'react'
import { useGameStore } from '@store/gameStore'
import './Prologue.css'

import bg from '@/assets/backgrounds/prologue/prologue.png'
import { LoadingScreen } from '../LoadingScreen'

function Prologue() {
  const {
    prologueCompleted,
    completePrologue,
    addSleepiness,
  } = useGameStore()

  const [visibleParagraphs, setVisibleParagraphs] = useState<number[]>([])
  const [isComplete, setIsComplete] = useState(false)

  const paragraphs = [
    `«Лобные доли сформированы. Ты больше не ребёнок, который убегает от чувств.`,

    `Бессмертие не в крови. Бессмертие в готовности умереть от скуки рядом с ней и воскреснуть от её смеха.`,

    `Она не отдаст сердце просто так.`,

    `Вперёд. Кот уже ест наполнитель.»`,
  ]

  const images = [bg]

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = bg
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  useEffect(() => {
    const allIndices = paragraphs.map((_, i) => i)

    allIndices.forEach((index, i) => {
      setTimeout(() => {
        setVisibleParagraphs((prev) => {
          if (!prev.includes(index)) {
            return [...prev, index]
          }
          return prev
        })
      }, i * 800)
    })

    setTimeout(() => {
      setIsComplete(true)
    }, paragraphs.length * 800 + 300)
  }, [])

  const handleStart = () => {
    addSleepiness(10)
    completePrologue()
  }

  if (prologueCompleted) return null

  return (
    <LoadingScreen images={images}>
      <div className="prologue">
        <img
          className="background"
          src={bg}
          alt="Prologue background"
        />

        <div className="prologue-overlay">
          <div className="text-container">
            {paragraphs.map((text, index) => (
              <p
                key={index}
                className={`prologue-paragraph ${visibleParagraphs.includes(index) ? 'visible' : ''
                  }`}
                style={{ transitionDelay: `${index * 0.3}s` }}
              >
                {text}
              </p>
            ))}

            {isComplete && (
              <button onClick={handleStart} className="start-button">
                [ В ПУТЬ! ]
              </button>
            )}
          </div>
        </div>
      </div>
    </LoadingScreen >
  )
}

export default Prologue