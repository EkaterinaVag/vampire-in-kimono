import playerStand from '@/assets/sprites/player/stand.png'
import playerLeft from '@/assets/sprites/player/left.png'
import playerRight from '@/assets/sprites/player/right.png'

const getPlayerSprite = (
  isMoving: boolean,
  isMovingLeft: boolean,
  sprites?: {
    stand?: string
    left?: string
    right?: string
  }
) => {
  const stand = sprites?.stand || playerStand
  const left = sprites?.left || playerLeft
  const right = sprites?.right || playerRight

  if (!isMoving) return stand
  if (isMovingLeft) return left
  return right
}

export default getPlayerSprite
