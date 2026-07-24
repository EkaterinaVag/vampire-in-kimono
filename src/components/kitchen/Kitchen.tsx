import { useState } from 'react'
import { useGameStore } from '@store/gameStore'
import { GameLayout } from '@components/GameLayout'
import { ArtifactNotification } from '../ui/artifactNotification/ArtifactNotification'
import { SleepinessVignette } from '../ui/sleepinessVignette/SleepinessVignette'
import { LoadingScreen } from '../LoadingScreen'
import './Kitchen.css'

import bg from '@/assets/backgrounds/kitchen/kitchen-2.png'
import bgTwo from '@/assets/backgrounds/kitchen/kitchen.png'
import icecream from '@/assets/items/icecream.png'
import blood from '@/assets/items/blood.png'
import soup from '@/assets//items/soup.png'
import catTwo from '@/assets/sprites/cat/cat-2.png'
import coffee from '@/assets/items/coffee.png'
import dill from '@/assets/items/artifacts/dill.png'

function Kitchen() {
  const {
    setProgress,
    setLocation,
    obtainArtifact,
    addItem,
    addSleepiness,
    addChokopai,
    effects
  } = useGameStore()

  const icecreamTaken = useGameStore(state => state.progress.kitchen_icecreamTaken)
  const rafTaken = useGameStore(state => state.progress.kitchen_rafTaken)
  const selectedChoice = useGameStore(state => state.progress.kitchen_choice)

  const [dialogText, setDialogText] = useState('')
  const [isShowNextBtn, setIsShowNextBtn] = useState(false)
  const [showArtifact, setShowArtifact] = useState(false)

  const [isFridgeOpen, setIsFridgeOpen] = useState(false)
  const [isIcecreamFading, setIsIcecreamFading] = useState(false)

  const images = [bg, bgTwo, icecream, blood, soup, catTwo, coffee, dill]

  // выбор
  const handleChoice = (choice: 'okroshka' | 'blood') => {
    if (selectedChoice) return

    setProgress('kitchen_choice', choice)

    if (choice === 'okroshka') {
      setDialogText(
        '«Окрошка… она делала её каждое лето. Я говорил, что не голоден. А потом доедал ночью, когда она спала.»'
      )
      setShowArtifact(true)
      obtainArtifact('heart_in_dill')
      addChokopai()
      addSleepiness(-10)
      setTimeout(() => {
        setDialogText(
          '«Мя. Ты выбрал правильно. Не потому, что я сказал. А потому, что ты сам этого хотел.»'
        )
      }, 3000)
    } else {
      setDialogText(
        '«Ты серьёзно? Она готовила окрошку для тебя. С любовью. А ты - к крови? Знаешь, что я думаю о вампирах, которые сначала пьют кровь, а потом приходят обниматься? У них изо рта пахнет… прошлым. Ешь окрошку. Ну пожалуйста. Я редко прошу.»'
      )
      addChokopai()
      addSleepiness(50)
      setTimeout(() => {
        setDialogText(
          '«Ладно… Твоя привычка. Но в следующий раз выбирай окрошку.»'
        )
      }, 10000)
    }
  }

  // холодильник открыт
  const handleFridgeClick = () => {
    setIsFridgeOpen(true)

    if (!icecreamTaken) {
      setDialogText('Тут пусто. Кроме инея и… чего это?')
    }
  }

  // мороженое
  const handleTakeIcecream = () => {
    if (icecreamTaken || isIcecreamFading) return

    setIsIcecreamFading(true)

    setTimeout(() => {
      addItem('icecream')
      setProgress('kitchen_icecreamTaken', true)
      setDialogText(
        '«Слушай, вампир. Я не могу всего объяснить. Но эта коробка… она важная. Очень. Спрячь её в кимоно. Не ешь. Не потеряй. Пригодится. Позже. Обещаю.»'
      )
    }, 1500)
  }

  // выбрать кофе
  const handleRafClick = () => {
    if (rafTaken) return

    addItem('raf')
    setProgress('kitchen_rafTaken', true)
    setDialogText('«Фу. Сладкое. Но тебе поможет. Пей. Кофе - это сила смертных.»')
  }

  const handleContinue = () => {
    if (effects.sleepiness >= 50) {
      setDialogText('Ты слишком сонный! Выпей кофе или отдохни прежде чем идти на мост!')
      setIsShowNextBtn(false)
      setTimeout(() => setIsShowNextBtn(true), 2000)
      return
    }
    setLocation('bridge')
  }

  const handleArtifactComplete = () => {
    setShowArtifact(false)
  }

  const handleCatClick = () => {
    setDialogText('Ладно. Выбор сделан. Дальше мост. Там нельзя бежать. Там нельзя кричать. Там можно только идти. Медленно. Как к ней. Когда боишься, но всё равно идёшь. Идём, вампир.')
    setTimeout(() => setIsShowNextBtn(true), 2000)
  }


  return (
    <LoadingScreen images={images}>
      <GameLayout
        dialogText={dialogText || 'Знаешь, как редко бессмертные получают еду, приготовленную с любовью? Никогда. Они едят кровь. Или заказывают доставку. А тут… окрошка. Я попробовал. Там укроп. Много укропа. Я не люблю укроп. Но почему-то не выплюнул.'}
        showNextBtn={isShowNextBtn}
        onNext={handleContinue}
      >
        <SleepinessVignette>
          <div className="kitchen">
            <img
              className="background"
              src={isFridgeOpen
                ? bg
                : bgTwo
              }
              alt="Kitchen background"
            />

            {!isFridgeOpen && (
              <div
                className="kitchen-item fridge"
                onClick={handleFridgeClick}
              />
            )}

            {isFridgeOpen && (
              <>
                <div
                  className={`kitchen-item icecream ${isIcecreamFading ? 'fading' : ''}`}
                  onClick={handleTakeIcecream}
                  style={{ cursor: isIcecreamFading ? 'default' : 'pointer' }}
                >
                  {!icecreamTaken && (
                    <><img src={icecream} alt="Мороженое" />
                      <span className="item-label">Взять мороженое</span>
                    </>
                  )}
                </div>

                <button className='close-fridge' onClick={() => setIsFridgeOpen(false)}>[ ЗАКРЫТЬ ХОЛОДИЛЬНИК ]</button>
              </>
            )}

            {!isFridgeOpen && (
              <>
                <div
                  className={`kitchen-item blood ${selectedChoice === 'blood' ? 'selected' : ''}`}
                  onClick={() => handleChoice('blood')}
                  style={{ cursor: selectedChoice ? 'default' : 'pointer' }}
                >
                  <img src={blood} alt="Кровь" />
                  <span className="item-label">Кровь</span>
                </div>

                <div
                  className={`kitchen-item okroshka ${selectedChoice === 'okroshka' ? 'selected' : ''}`}
                  onClick={() => handleChoice('okroshka')}
                  style={{ cursor: selectedChoice ? 'default' : 'pointer' }}
                >
                  <img src={soup} alt="Окрошка" />
                  <span className="item-label">Окрошка</span>
                </div>

                <div
                  className={`cat ${selectedChoice ? 'active' : 'inactive'}`}
                  onClick={selectedChoice ? handleCatClick : undefined}
                >
                  <img src={catTwo} alt="cat" />
                </div>

                {!rafTaken && (
                  <div
                    className={`kitchen-item raf ${rafTaken ? 'taken' : ''}`}
                    onClick={handleRafClick}
                    style={{ cursor: rafTaken ? 'default' : 'pointer' }}
                  >
                    <img src={coffee} alt="Кофе" />
                  </div>
                )}
              </>
            )}

            {showArtifact && (
              <ArtifactNotification
                artifactName="Сердце в укропе"
                artifactIcon={dill}
                onComplete={handleArtifactComplete}
              />
            )}
          </div>
        </SleepinessVignette>
      </GameLayout >
    </LoadingScreen>
  )
}

export default Kitchen