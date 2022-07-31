import * as React from 'react'
import {useEffect, useState} from 'react'
import { Subject } from 'rxjs'
import {Provider, useDispatch} from 'react-redux'
import { createStore, applyMiddleware } from 'redux'

import swordImage from '../assets/sword.jpeg'
import classes from './game.module.css'

import Card from './card'
import { rateLimit } from './rateLimit'

const enum CardKinds {
  ATTACK
}

const cardNames: Record<CardKinds, string> = {
 [CardKinds.ATTACK]: 'Attack'
}
const cardDescriptions: Record<CardKinds, string> = {
  [CardKinds.ATTACK]: 'Regular attack'
 }

 const cardImages: Record<CardKinds, string> = {
  [CardKinds.ATTACK]: swordImage
 }


interface Card {
  id: number
  kind: CardKinds
}

interface AttackCard extends Card {
  kind: CardKinds.ATTACK
  value: number
}

const createCardFactory = () => {
  let lastId = 0

  return function <T extends Card>(params: Omit<T, 'id'>) {
    return {
      id: ++lastId,
      ...params
    }
  }
}

const cardFactory = createCardFactory()

interface Player {
  name: string
  health: number
  cards: Card[]
}

interface State {
  players: Player[]
  currentPlayerIndex: number
}

type Action = { type: 'useCard', card: Card } | { type: 'nextTurn' }

const rootReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'useCard':
      const victimIndex = state.currentPlayerIndex === 0 ? 1 : 0

      const attacker = state.players[state.currentPlayerIndex]
      const victim = state.players[victimIndex]
      const newAttacker = { ...attacker, cards: attacker.cards.filter(card => card.id !== action.card.id)}
      const newVictim = { ...victim, health: victim.health - 1 }

      const players = state.currentPlayerIndex === 0 ? [newAttacker, newVictim] : [newVictim, newAttacker]

      return { ...state, players, currentPlayerIndex: (state.currentPlayerIndex + 1) % 2 }

    case 'nextTurn':
      return { ...state }
  }
  return state
}

const turnFinisher = ({ dispatch }) => next => action => {
  const returnValue = next(action)

  if (action.type !== 'nextTurn') {
    dispatch({ type: 'nextTurn' })
  }

  return returnValue
}

const store = createStore<State, Action, any, any>(rootReducer, {
  players: [
    {
      name: 'Player #1',
      cards: [
        cardFactory<AttackCard>({
          kind: CardKinds.ATTACK,
          value: 1
        }),
        cardFactory<AttackCard>({
          kind: CardKinds.ATTACK,
          value: 1
        }),
        cardFactory<AttackCard>({
          kind: CardKinds.ATTACK,
          value: 1
        }),
      ],
      health: 10
    },
    { name: 'Player #2', cards: [], health: 10 }
  ],
  currentPlayerIndex: 0
},  applyMiddleware(turnFinisher))

const storeObservable = new Subject<State>()

store.subscribe(() => storeObservable.next(store.getState()))

function selectPlayer(state: State, index: number) {
  return state.players[index]
}

function selectPlayers(state: State) {
  return state.players
}

function selectCurrentPlayer(state: State) {
  return state.currentPlayerIndex
}

function useTurnBasedState() {
  const [theLatestValue, setTheLatestValue] = useState(() => store.getState())
  const [value, setValue] = useState(() => store.getState())

  useEffect(() => {
    const subscription = storeObservable
      .subscribe((newValue) => {
        setTheLatestValue(newValue)
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const subscription = storeObservable
      .pipe(rateLimit(1, 1000))
      .subscribe((newValue) => {
        setValue(newValue)
      })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { synced: theLatestValue === value, value }
}

function Board({ playerId }: { playerId: number }) {
  const { synced, value } = useTurnBasedState()
  const player = selectPlayer(value, playerId)
  const currentPlayer = selectCurrentPlayer(value)
  const players = selectPlayers(value)

  const dispatch = useDispatch()

  const isMyTurn = synced && currentPlayer === playerId

  return (
    <div className={classes.world}>
      <div className={classes.board}>
        <div className={classes.field}>
          <div className={classes.player}>
            Whirley
          </div>

          <div classname={classes.main}>
            MAIN
          </div>

          <div className={classes.enemy}>
            Wolf
          </div>
        </div>

        <div className={[classes.cardStack, isMyTurn ? '' : classes.cardStackDisabled].join(' ')}>
          {player.cards.map(card => (
            <Card
              key={card.id}
              onClick={() => dispatch({ type: 'useCard', card })}
              name={cardNames[card.kind]}
              description={cardDescriptions[card.kind]}
              image={cardImages[card.kind]}
              color='red'
            />
          ))}
        </div>
      </div>
    </div>
  )
}

const AI = ({ playerId }: { playerId: number }) => {
  const { synced, value } = useTurnBasedState()
  const currentPlayer = selectCurrentPlayer(value)
  const isMyTurn = synced && currentPlayer === playerId

  const dispatch = useDispatch()

  useEffect(() => {
    if (isMyTurn) {
      dispatch({ type: 'useCard', card: currentPlayer.cards })
    }
  }, [dispatch, isMyTurn])

  return null
}

function Game() {
  return (
    <Provider store={store}>
      <Board playerId={0} />
      <AI playerId={1} />
    </Provider>)
}

export default Game
