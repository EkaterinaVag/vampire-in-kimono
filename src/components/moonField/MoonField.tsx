import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '@store/gameStore'
import { LoadingScreen } from '../LoadingScreen'
import { GameLayout } from '../GameLayout'
import './MoonField.css'

import bg from '@/assets/backgrounds/moon-field/moon.jpg'
import bush from '@/assets/sprites/bush.png'

type FinalStep = 'idle' | 'hand' | 'icecream' | 'turn_away' | 'complete'
type TestStep = 'idle' | 'showing' | 'question' | 'complete'

function MoonFieldContent() {
  const {
    items,
    setProgress,
    setLocation,
    hasArtifact,
  } = useGameStore()

  // --- СОСТОЯНИЯ ---
  const [dialogText, setDialogText] = useState('')
  const [isShowNextBtn, setIsShowNextBtn] = useState(false)
  const [showFinalTest, setShowFinalTest] = useState(false)

  // Состояния финала
  const [step, setStep] = useState<FinalStep>('idle')
  const [catVisible, setCatVisible] = useState(false)
  const [isCatFed, setIsCatFed] = useState(false)
  const [trust, setTrust] = useState(0)
  const [errorCount, setErrorCount] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Состояния модального окна (финальное испытание)
  const [testStep, setTestStep] = useState<TestStep>('idle')
  const [testDialog, setTestDialog] = useState('')
  const [isTestInputVisible, setIsTestInputVisible] = useState(false)

  const timerRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)

  const hasIcecream = items.includes('icecream')

  // --- РАСЧЁТ ДОВЕРИЯ ---
  const calculateTrust = () => {
    let trustValue = 0
    const artifacts = {
      'wisdom_purr': 15,
      'rattle': 10,
      'heart_in_dill': 25,
      'silent_step': 20,
      'fur_clump': 10
    }

    Object.entries(artifacts).forEach(([id, value]) => {
      if (hasArtifact(id)) trustValue += value
    })

    const allArtifacts = ['wisdom_purr', 'rattle', 'heart_in_dill', 'silent_step', 'fur_clump']
    const hasAll = allArtifacts.every(id => hasArtifact(id))
    if (hasAll) trustValue += 10

    return Math.min(100, trustValue)
  }

  // --- ПОЛУЧЕНИЕ СООБЩЕНИЙ ОТ КОТА ---
  const getCatMessage = (trustValue: number): string => {
    if (trustValue >= 80) {
      return '🐱 «Она чувствует твою доброту. Ты готов. Подойди к кусту.»'
    } else if (trustValue >= 50) {
      return '🐱 «Она колеблется. Но ты справишься. Протяни руку медленно.»'
    } else if (trustValue >= 30) {
      return '🐱 «Она насторожена. Будь терпелив. Протяни руку и подожди.»'
    } else {
      return '🐱 «Она боится. Ты должен заслужить доверие. Начни с малого — протяни руку.»'
    }
  }

  // --- ИНИЦИАЛИЗАЦИЯ ---
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // --- ПРОВЕРКА МОРОЖЕНОГО ---
  useEffect(() => {
    if (!hasIcecream) {
      setDialogText('🍦 Ты забыл мороженое! Вернись на кухню и возьми его.')

      timerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setProgress('return_from_final', true)
          setLocation('kitchen')
        }
      }, 5000)
    } else {
      const trustValue = calculateTrust()
      setTrust(trustValue)
      setDialogText(getCatMessage(trustValue))
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [hasIcecream])

  // --- ОБРАБОТЧИКИ ДЕЙСТВИЙ ---
  const approachBush = () => {
    if (!hasIcecream || step !== 'idle' || isTransitioning) return

    setCatVisible(true)
    setIsTransitioning(true)

    setTimeout(() => {
      if (isMountedRef.current) {
        setStep('hand')
        setDialogText('🐱 «Протяни руку. Не делай резких движений.»')
        setIsTransitioning(false)
      }
    }, 1500)
  }

  const extendHand = () => {
    if (step !== 'hand' || isTransitioning) return

    setDialogText('🐱 Кошка осторожно нюхает твои пальцы...')
    setIsTransitioning(true)

    setTimeout(() => {
      if (isMountedRef.current) {
        setStep('icecream')
        setDialogText('🐱 Теперь предложи ей угощение. Мороженое.')
        setIsTransitioning(false)
      }
    }, 1500)
  }

  const giveIcecream = () => {
    if (step !== 'icecream' || isTransitioning) return

    setIsCatFed(true)
    setDialogText('🐱 Она рада мороженному!')
    setIsTransitioning(true)

    setTimeout(() => {
      if (isMountedRef.current) {
        setDialogText('🐱 Кошка довольно мурчит! Она начала тебе доверять!')

        setTimeout(() => {
          if (isMountedRef.current) {
            setStep('turn_away')
            setDialogText('🐱 Теперь дай ей пространство. Это последний шаг.')
            setIsTransitioning(false)
          }
        }, 1500)
      }
    }, 2000)
  }

  const turnAway = () => {
    if (step !== 'turn_away' || isTransitioning) return

    setDialogText('🐱 Кошка выходит из куста...')
    setIsTransitioning(true)

    setTimeout(() => {
      if (isMountedRef.current) {
        setDialogText('🐱 Кошка трётся о твою ногу и громко мурлычет. Ты согрел её сердце!')

        setTimeout(() => {
          if (isMountedRef.current) {
            setStep('complete')
            setProgress('moon_sequenceCompleted', true)
            setDialogText('🐱 Кошка доверяет тебе полностью. У нее есть для тебя последнее испытание')
            setIsShowNextBtn(true)
          }
        }, 2000)
      }
    }, 1500)
  }

  // --- ОШИБКА (фразы от кота) ---
  const handleWrongStep = () => {
    if (isTransitioning) return

    const newErrorCount = errorCount + 1
    setErrorCount(newErrorCount)

    const errorMessages = {
      1: '🐱 «Сначала рука. Протяни её медленно и спокойно.»',
      2: '🐱 «Теперь предложи ей угощение. Положи мороженое перед ней.»',
      3: '🐱 «Рука → мороженое → отвернуться. Просто следуй порядку, и всё получится.»',
      4: '🐱 «Не торопись. Доверие не строится за секунду. Попробуй снова.»'
    }

    const message = errorMessages[newErrorCount as keyof typeof errorMessages] ||
      '🐱 «Следуй порядку: рука, мороженое, отвернуться.»'

    setDialogText(message)

    if (step === 'idle') setStep('hand')
  }

  // --- ФИНАЛЬНОЕ ИСПЫТАНИЕ (БЕЗ ПРОВЕРКИ) ---
  const startFinalTest = () => {
    setShowFinalTest(true)
    setTestStep('showing')
    setTestDialog('📖 «Шила в мешке да любви в сердце не утаишь.»')

    // Показываем кнопку для продолжения
    setTimeout(() => {
      setIsTestInputVisible(true)
    }, 1500)
  }

  // Показывает следующий шаг испытания
  const showNextTestStep = () => {
    if (testStep === 'showing') {
      setTestDialog('✨ «Запятые не важны! Ты уже покорил меня своей красотой.»')
      setTestStep('question')
      setIsTestInputVisible(false)

      setTimeout(() => {
        setTestDialog('🔍 А теперь найди сюрприз. Он там, где кошка.')
        setTestStep('complete')
        setIsTestInputVisible(true)
      }, 2000)
    }
  }

  // Завершить испытание
  const completeTest = () => {
    setShowFinalTest(false)
    setProgress('moon_test_completed', true)
    setLocation('moon_field_final')
    setDialogText('🌟 Ты нашёл сюрприз! Кошка оставила тебе Лунный камень.')
  }

  // --- ПЕРЕХОД ---
  const handleContinue = () => {
    startFinalTest()
  }

  // --- ОТОБРАЖЕНИЕ КНОПОК ДЕЙСТВИЙ ---
  const renderButtons = () => {
    if (step === 'idle') return null
    if (step === 'complete') return null

    return (
      <div className="final-buttons">
        {step === 'hand' && (
          <button className="final-btn hand-btn" onClick={extendHand}>
            ✋ Протянуть руку
          </button>
        )}
        {step === 'icecream' && hasIcecream && (
          <button className="final-btn icecream-btn" onClick={giveIcecream}>
            🍦 Предложить мороженое
          </button>
        )}
        {step === 'turn_away' && (
          <button className="final-btn turn-btn" onClick={turnAway}>
            🎭 Отвернуться
          </button>
        )}
      </div>
    )
  }

  // --- РЕНДЕР ---
  return (
    <>
      <GameLayout
        dialogText={dialogText}
        showNextBtn={isShowNextBtn}
        onNext={handleContinue}
        nextBtnText="✨ ПЕРЕЙТИ К ИСПЫТАНИЮ ➜"
      >
        <div className="moon-field">
          <img
            className="background"
            src={bg}
            alt="Лунное поле"
          />

          {/* КУСТ */}
          <div
            className={`bush-container ${catVisible ? 'cat-visible' : ''}`}
            onClick={approachBush}
            style={{
              cursor: step === 'idle' && hasIcecream && !isTransitioning
                ? 'pointer'
                : 'default'
            }}
          >
            <img
              className="bush"
              src={bush}
              alt="Куст"
            />

            {step === 'idle' && hasIcecream && (
              <div className="bush-hint">
                <span className="pulse">🖱️ Нажми на куст</span>
              </div>
            )}
          </div>

          {/* КОШКА В КУСТЕ */}
          {catVisible && step !== 'complete' && step !== 'idle' && (
            <div className={`black-cat ${step === 'complete' ? 'hidden' : ''}`}>
              <div className="cat-eyes">👀</div>
              <div className="cat-body"></div>
              <div className="cat-tail"></div>
            </div>
          )}

          {/* СЧАСТЛИВАЯ КОШКА */}
          {step === 'complete' && (
            <div className="cat-happy">
              <div className="cat-happy-body">🐈‍⬛</div>
              <div className="purr-animation">
                <span className="purr-text">♡ мур-мур-мур ♡</span>
                <span className="heart">❤️</span>
                <span className="heart">💕</span>
              </div>
            </div>
          )}

          {/* КНОПКИ ДЕЙСТВИЙ */}
          {renderButtons()}
        </div>
      </GameLayout>

      {/* ФИНАЛЬНОЕ ИСПЫТАНИЕ */}
      {showFinalTest && (
        <div className="final-test-overlay">
          <div className="final-test-content">
            <span className="test-icon">📜</span>
            <h2>Последнее испытание</h2>

            <div className="test-text">
              {testDialog.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>

            {/* Кнопка для перехода к следующему шагу */}
            {testStep === 'showing' && isTestInputVisible && (
              <button
                className="test-continue-btn"
                onClick={showNextTestStep}
              >
                👆 Понял! Продолжить
              </button>
            )}

            {/* Декоративное поле ввода (необязательное) */}
            {testStep === 'question' && (
              <div className="test-decorative">
                <p className="test-hint">💭 Запятые не имеют значения. Важно то, что в твоём сердце.</p>
                <button
                  className="test-continue-btn"
                  onClick={showNextTestStep}
                >
                  ✨ Понял! Идём дальше
                </button>
              </div>
            )}

            {/* Завершение испытания */}
            {testStep === 'complete' && isTestInputVisible && (
              <button
                className="test-complete-btn"
                onClick={completeTest}
              >
                🎁 Найти сюрприз
              </button>
            )}
          </div>
        </div>
      )}
    </>
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