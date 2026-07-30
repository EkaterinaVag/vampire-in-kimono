import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '@store/gameStore'
import { LoadingScreen } from '../LoadingScreen'
import { GameLayout } from '../GameLayout'
import './MoonField.css'

import bg from '@/assets/backgrounds/moon-field/moon.jpg'
import bush from '@/assets/sprites/bush.png'
import catOne from '@/assets/sprites/cat/black-cat-3.png'
import catTwo from '@/assets/sprites/cat/black-cat.png'
import catHappy from '@/assets/sprites/cat/black-cat-2.png'

type Action = 'hand' | 'icecream' | 'turn_away' | null

function MoonFieldContent() {
  const { setProgress, setLocation, hasArtifact, removeItem } = useGameStore()
  const hasIcecream = useGameStore(state => state.progress.kitchen_icecreamTaken)

  const [dialogText, setDialogText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const [isShowNextBtn, setIsShowNextBtn] = useState(false)

  // Состояние доверия
  const [catState, setCatState] = useState<'behind_bush' | 'outside'>('behind_bush')

  // Логика последовательности
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [errorCount, setErrorCount] = useState(0)
  const [isBlocked, setIsBlocked] = useState(false)

  const [showFinalModal, setShowFinalModal] = useState(false)
  const [showFinalTest, setShowFinalTest] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testStep, setTestStep] = useState<'intro' | 'complete'>('intro')
  const [punctuationInputs, setPunctuationInputs] = useState<string[]>([])

  const [showRestartBtn, setShowRestartBtn] = useState(false)

  const timerRef = useRef<number | null>(null)

  const TRUST = { HIGH: 100, MEDIUM: 70 } as const
  const sentence = 'Шила в мешке да любви в сердце не утаишь.'
  const words = sentence.split(' ')
  const paragraphs = [
    `«Ты не пришёл убивать. Ты пришёл гладить.`,
    `Чёрная вислоухая кошка мурчит - значит, бессмертие обретено.`,
    `Она не отдавала тебе своё сердце - она позволила тебе его согреть.`,
    `Ты стал вампиром не потому, что пьёшь кровь, а потому что теперь у тебя есть ради кого не бояться вечности.`,
    `Сердце  теперь в твоих руках. Не разбей.»`,
  ]

  // РАСЧЕТ ДОВЕРИЯ
  const calculateTrust = () => {
    const artifacts: Record<string, number> = {
      wisdom_purr: 20,
      rattle: 20,
      heart_in_dill: 25,
      silent_step: 20,
      fur_clump: 15
    }

    let trustValue = Object.entries(artifacts).reduce(
      (sum, [id, value]) => sum + (hasArtifact(id) ? value : 0),
      0
    )

    const allArtifacts = Object.keys(artifacts)
    if (allArtifacts.every(id => hasArtifact(id))) {
      trustValue += 10
    }

    return Math.min(100, trustValue)
  }

  const getCatMessage = (trustValue: number) => {
    if (trustValue === TRUST.HIGH) {
      return 'Ты собрал все артефакты и кошка полностью доверяет тебе! Она вышла из куста. Просто угости её мороженым.'
    }
    return trustValue >= TRUST.MEDIUM
      ? 'Кошка выглядывает из куста. Она готова познакомиться.'
      : 'Кошка прячется в кустах. Тебе нужно заслужить её доверие шаг за шагом.'
  }

  const getRequiredSteps = (trustValue: number): Action[] => {
    if (trustValue === TRUST.HIGH) return ['icecream']
    if (trustValue >= TRUST.MEDIUM) return ['hand', 'icecream']
    return ['hand', 'icecream', 'turn_away']
  }

  const trustValue = calculateTrust()
  const trustLevel = trustValue === TRUST.HIGH ? 'high'
    : trustValue >= TRUST.MEDIUM ? 'medium'
      : 'low'
  const requiredSteps = getRequiredSteps(trustValue)

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setDialogText(getCatMessage(trustValue))
      if (trustLevel === 'high') {
        setCatState('outside')
      }
    }, 0)
  }, [])

  // Завершение последовательности
  const completeSequence = () => {
    setIsComplete(true)
    setCatState('outside')
    setProgress('moon_sequenceCompleted', true)
    setDialogText('Ну вот и всё. Бессмертие получено. Но есть один незавершённый квест. Он очень сложный. С ним не справлялись даже драконы. Готов?')

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => setIsShowNextBtn(true), 2000)
  }

  // Обработка действий
  const handleAction = (action: Action) => {
    if (isBlocked || isComplete) return

    // Проверка мороженого
    if (!hasIcecream) {
      setDialogText('Ты забыл мороженое! Вернись на кухню и возьми его.')
      setIsBlocked(true)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        setProgress('return_from_final', true)
        setLocation('kitchen')
      }, 3000)
      return
    }

    const expectedAction = requiredSteps[currentStep]

    if (action && action === expectedAction) {
      // Правильное действие
      const newStep = currentStep + 1
      setCurrentStep(newStep)

      // Обновление состояния и диалога
      const actionUpdates = {
        hand: () => {
          if (trustLevel !== 'high') setCatState('outside')
          return 'Кошка осторожно нюхает твои пальцы... Она начинает привыкать. Теперь она доверяет тебе больше!'
        },
        icecream: () => {
          removeItem('icecream')
          return 'Кошка с удовольствием ест мороженое! Она мурлычет!'
        },
        turn_away: () => 'Кошка выходит из куста и трётся о твою ногу!'
      }

      setDialogText(actionUpdates[action]())

      if (newStep >= requiredSteps.length) {
        completeSequence()
      }
    } else {
      // Ошибка
      const newErrorCount = errorCount + 1
      setErrorCount(newErrorCount)
      setIsBlocked(true)

      const errorMessages: Record<number, string> = {
        1: 'Неправильно! Попробуй ещё раз.',
        2: 'Не торопись. Посмотри на кошку и подумай, что ей нужно.',
        3: 'Подсказка: начни с самого простого - протяни руку.'
      }

      setDialogText(
        newErrorCount < 3
          ? errorMessages[newErrorCount]
          : 'Следуй порядку: рука → мороженое → отвернуться.'
      )

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        setIsBlocked(false)
      }, 2000)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  // ФИНАЛЬНОЕ ИСПЫТАНИЕ 
  const startFinalTest = () => {
    setShowFinalModal(false)
    setShowFinalTest(true)
    setTestStep('intro')
    setTestMessage('Расставь запятые в предложении:')

    setPunctuationInputs(new Array(words.length - 1).fill(''))
  }

  const handlePunctuationChange = (index: number, value: string) => {
    const newInputs = [...punctuationInputs]
    newInputs[index] = value ? ',' : ''
    setPunctuationInputs(newInputs)
  }

  const handlePunctuationSubmit = () => {
    setTestStep('complete')
    setTestMessage('Запятые не важны! Ты уже покорил меня своей красотой.')

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setTestMessage('Последний артефакт кроется там где отдыхает кошка - найди его!')

      setTimeout(() => {
        setShowRestartBtn(true)
      }, 2000)
    }, 3000)
  }

  const handleRestart = () => {
    useGameStore.getState().reset()
    window.location.reload()
  }

  // ОТОБРАЖЕНИЕ КНОПОК
  const renderButtons = () => {
    if (isBlocked) {
      return <div className="blocked-hint">Подожди секунду...</div>
    }

    if (isComplete) return null

    const availableActions = [...new Set(requiredSteps.slice(currentStep))]
    const buttonConfig = {
      icecream: { label: 'Мороженое', className: 'icecream-btn' },
      hand: { label: 'Протянуть руку', className: 'hand-btn' },
      turn_away: { label: 'Отвернуться', className: 'turn-btn' }
    }

    return (
      <div className="action-buttons">
        {availableActions.map(action => {
          if (!action) return null

          const config = buttonConfig[action]
          return (
            <button
              key={action}
              className={`action-btn ${config.className}`}
              onClick={() => handleAction(action)}
            >
              {config.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <GameLayout dialogText={dialogText}
      showNextBtn={isShowNextBtn}
      onNext={() => {
        setDialogText('')
        setShowFinalModal(true)
        setIsShowNextBtn(false)
      }}
      nextBtnText="[ ДА! ]"
    >
      <div className="moon-field">
        <img className="background" src={bg} alt="Лунное поле" />

        <div className="bush-container">
          <img className="bush" src={bush} alt="Куст" />

          {/* КОШКА ЗА КУСТОМ */}
          {catState === 'behind_bush' && !isComplete && (
            <div className="black-cat behind-bush">
              <img src={catOne} alt="кошка" />
            </div>
          )}
        </div>

        {/* КОШКА СНАРУЖИ */}
        {(catState === 'outside' || trustLevel === 'high') && !isComplete && (
          <div className="black-cat outside">
            <img src={catTwo} alt="кошка" />
          </div>
        )}

        {/* СЧАСТЛИВАЯ КОШКА */}
        {isComplete && (
          <div className="cat-happy">
            <img src={catHappy} alt="кошка" />

            <div className="purr-animation">
              <span className="purr-text">мур-мур-мур</span>
              <span className="heart">💕</span>
            </div>
          </div>
        )}

        {/* ИНДИКАТОР ДОВЕРИЯ */}
        {!isComplete && (
          <div className="trust-indicator">
            <span>Доверие: {trustValue}%</span>
            <div className="trust-bar">
              <div
                className={`trust-fill ${trustLevel}`}
                style={{ width: `${trustValue}%` }}
              />
            </div>
            <span className="trust-label">
              {trustLevel === 'high' && 'Полное доверие'}
              {trustLevel === 'medium' && 'Насторожена'}
              {trustLevel === 'low' && 'Пуглива'}
            </span>
          </div>
        )}

        {/* КНОПКИ ДЕЙСТВИЙ */}
        {renderButtons()}

        {showFinalModal && (
          <div className="final-modal-overlay">
            <div className="final-modal-content">
              {paragraphs.map((text, index) => (
                <p key={index}>
                  {text}
                </p>
              ))}

              <button onClick={startFinalTest}>[ ПРОЙТИ ФИНАЛЬНОЕ ИСПЫТАНИЕ ➜ ]</button>
            </div>
          </div>
        )}

        {showFinalTest && (
          <div className="final-test-overlay">
            <div className="final-test-content">
              {testStep === 'intro' && (
                <>
                  <span className="test-icon">📜</span>
                  <h2>Последнее испытание</h2>

                  <p className="test-instruction">{testMessage}</p>

                  <div className="punctuation-sentence">
                    {words.map((word, index) => (
                      <span key={index} className="word-with-input">
                        <span className="word">{word}</span>
                        {index < words.length - 1 && (
                          <input
                            type="text"
                            className="punctuation-input"
                            placeholder="?"
                            value={punctuationInputs[index] || ''}
                            onChange={(e) => handlePunctuationChange(index, e.target.value)}
                            maxLength={1}
                            autoFocus={index === 0}
                            onKeyDown={(e) => {
                              const allowedKeys = [',', 'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight']
                              if (!allowedKeys.includes(e.key) && !e.key.startsWith('Arrow')) {
                                e.preventDefault()
                              }
                            }}
                          />
                        )}
                      </span>
                    ))}
                  </div>

                  <button
                    className="test-submit-btn"
                    onClick={handlePunctuationSubmit}
                  > Проверить
                  </button>

                  <p className="test-hint">Поставь запятые где считаешь нужным</p>
                </>
              )}

              {testStep === 'complete' && (
                <>
                  <span className="test-icon">✨</span>
                  <p className="test-message">{testMessage}</p>

                  {showRestartBtn && (
                    <button className="restart-btn" onClick={handleRestart}>
                      Пройти игру заново
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  )
}

function MoonField() {
  const images = [bg, bush]

  return (
    <LoadingScreen images={images} minLoadingTime={1000}>
      <MoonFieldContent />
    </LoadingScreen>
  )
}

export default MoonField
