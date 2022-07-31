import * as React from 'react'

import classes from './card.module.css'

type CardColor = 'grey' | 'red'

interface Props {
    name: string
    description: string
    image: string
    color: CardColor
    onClick?: () => void
}

const colorMapping: Record<CardColor, string> = {
    red: classes.colorRed,
    grey: classes.colorGrey
}

const Card = ({ name, description, image, color, onClick }: Props) => {
  return (
    <div className={[classes.card, colorMapping[color]].join(' ')} onClick={onClick}>
        <img className={classes.image} src={image} />

        <div className={classes.content}>
            <div className={classes.name}>{name}</div>
            <div className={classes.description}>
                {description}
            </div>
        </div>

    </div>
  )
}

export default Card
