import { useState } from 'react'
import { useGameStore } from '@store/gameStore'
import { GameLayout } from '@components/GameLayout'
import { ArtifactNotification } from '../ui/artifactNotification/ArtifactNotification'
import './Kitchen.css'

function Kitchen() {
  const { setProgress, setLocation, obtainArtifact, addItem } = useGameStore()

  const [dialogText, setDialogText] = useState('')
  const [isShowNextBtn, setIsShowNextBtn] = useState(false)
  const [showArtifact, setShowArtifact] = useState(false)

  const [selectedChoice, setSelectedChoice] = useState<'okroshka' | 'blood' | null>(null)
  const [icecreamTaken, setIcecreamTaken] = useState(false)
  const [rafTaken, setRafTaken] = useState(false)
  const [isFridgeOpen, setIsFridgeOpen] = useState(false)
  const [isIcecreamFading, setIsIcecreamFading] = useState(false)

  // выбор
  const handleChoice = (choice: 'okroshka' | 'blood') => {
    if (selectedChoice) return

    setSelectedChoice(choice)
    setProgress('kitchen_choice', choice)

    if (choice === 'okroshka') {
      setDialogText(
        '«Окрошка… она делала её каждое лето. Я говорил, что не голоден. А потом доедал ночью, когда она спала.»'
      )
      setShowArtifact(true)
      obtainArtifact('heart_in_dill')
      addItem('chokopai')
      setTimeout(() => {
        setDialogText(
          '«Мя. Ты выбрал правильно. Не потому, что я сказал. А потому, что ты сам этого хотел.»'
        )
      }, 3000)
    } else {
      setDialogText(
        '«Ты серьёзно? Она готовила. Для ТЕБЯ. Окрошку. С любовью. А ты - к крови? Знаешь, что я думаю о вампирах, которые сначала пьют кровь, а потом приходят обниматься? У них изо рта пахнет… прошлым. Ешь окрошку. Ну пожалуйста. Я редко прошу.»'
      )
      addItem('chokopai')
      setTimeout(() => {
        setDialogText(
          '«Ладно… Твоя привычка. Но в следующий раз выбирай окрошку.»'
        )
      }, 10000)
    }
  }

  // холодильник открыт
  const handleFridgeClick = () => {
    if (icecreamTaken) return

    setIsFridgeOpen(true)
    setDialogText('Тут пусто. Кроме инея и… чего это?')
  }

  // мороженое
  const handleTakeIcecream = () => {
    if (icecreamTaken || isIcecreamFading) return

    setIsIcecreamFading(true)

    setTimeout(() => {
      setIcecreamTaken(true)
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

    setRafTaken(true)
    addItem('raf')
    setProgress('kitchen_rafTaken', true)
    setDialogText('«Фу. Сладкое. Но тебе поможет. Пей. Кофе — это сила смертных.»')
  }

  const handleContinue = () => {
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
    <GameLayout
      dialogText={dialogText || 'Знаешь, как редко бессмертные получают еду, приготовленную с любовью? Никогда. Они едят кровь. Или заказывают доставку. А тут… окрошка. Я попробовал. Там укроп. Много укропа. Я не люблю укроп. Но почему-то не выплюнул.'}
      showNextBtn={isShowNextBtn}
      onNext={handleContinue}
    >
      <div className="kitchen">
        <img
          className="background"
          src={isFridgeOpen
            ? "src/assets/backgrounds/kitchen/kitchen-2.png"
            : "src/assets/backgrounds/kitchen/kitchen.png"
          }
          alt="Kitchen background"
        />

        {!isFridgeOpen && (
          <div
            className="kitchen-item fridge"
            onClick={handleFridgeClick}
          />
        )}

        {isFridgeOpen && !icecreamTaken && (
          <div
            className={`kitchen-item icecream ${isIcecreamFading ? 'fading' : ''}`}
            onClick={handleTakeIcecream}
            style={{ cursor: isIcecreamFading ? 'default' : 'pointer' }}
          >
            <img src="src/assets/items/icecream.png" alt="Мороженое" />
            <span className="item-label">Взять мороженое</span>
          </div>
        )}

        {!isFridgeOpen && (
          <>
            <div
              className={`kitchen-item blood ${selectedChoice === 'blood' ? 'selected' : ''}`}
              onClick={() => handleChoice('blood')}
              style={{ cursor: selectedChoice ? 'default' : 'pointer' }}
            >
              <img src="src/assets/items/blood.png" alt="Кровь" />
              <span className="item-label">Кровь</span>
            </div>

            <div
              className={`kitchen-item okroshka ${selectedChoice === 'okroshka' ? 'selected' : ''}`}
              onClick={() => handleChoice('okroshka')}
              style={{ cursor: selectedChoice ? 'default' : 'pointer' }}
            >
              <img src="src/assets/items/soup.png" alt="Окрошка" />
              <span className="item-label">Окрошка</span>
            </div>

            <div
              className={`kitchen-item raf ${rafTaken ? 'taken' : ''}`}
              onClick={handleRafClick}
              style={{ cursor: rafTaken ? 'default' : 'pointer' }}
            >
              <img src="src/assets/items/coffee.png" alt="Кофе" />
            </div>

            <div
              className={`cat ${selectedChoice ? 'active' : 'inactive'}`}
              onClick={selectedChoice ? handleCatClick : undefined}
            >
              <img src="src/assets/sprites/cat/cat-2.png" alt="cat" />
            </div>
          </>
        )}

        {showArtifact && (
          <ArtifactNotification
            artifactName="Сердце в укропе"
            artifactIcon="src/assets/items/artifacts/dill.png"
            onComplete={handleArtifactComplete}
          />
        )}
      </div>
    </GameLayout>
  )
}

export default Kitchen