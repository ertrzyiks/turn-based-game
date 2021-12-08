import * as React from 'react'
import {useEffect, useState} from 'react'
import { Subject } from 'rxjs'
import {Provider, useDispatch} from 'react-redux'
import { createStore, applyMiddleware } from 'redux'

import classes from './game.module.css'

import { rateLimit } from './rateLimit'

type Sign = 'o' | 'x'
type Cell = Sign | null

interface State {
  board: Cell[]
  players: [string, string]
  currentPlayerIndex: number
}

type Action = { type: 'select', row: number, col: number } | { type: 'nextTurn' }

const rootReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'select':
      const board = state.board.slice()
      board[action.row * 3 + action.col] = state.currentPlayerIndex === 0 ? 'o' : 'x'
      return { ...state, board, currentPlayerIndex: (state.currentPlayerIndex + 1) % 2 }

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
  board: [
    null, null, null,
    null, null, null,
    null, null, null
  ],
  players: ['Player #1', 'Player #2'],
  currentPlayerIndex: 0
},  applyMiddleware(turnFinisher))

const storeObservable = new Subject<State>()

store.subscribe(() => storeObservable.next(store.getState()))

function selectPlayer(state: State, index: number) {
  return state.players[index]
}

function selectCurrentPlayer(state: State) {
  return state.currentPlayerIndex
}

function selectBoard(state: State) {
  return state.board
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

  const board = selectBoard(value)

  const dispatch = useDispatch()

  const chunkedBoard = [
    board.slice(0, 3),
    board.slice(3, 6),
    board.slice(6, 9)
  ]

  const isMyTurn = synced && currentPlayer === playerId

  return (
    <div>
      <h2>{player}</h2>
      {chunkedBoard.map((row, rowIndex) => (
        <div key={rowIndex} className={classes.row}>
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={[classes.tile, isMyTurn ? classes.activeTile : classes.normalTile].join(' ')}
              onClick={isMyTurn ? () => dispatch({ type: 'select', row: rowIndex, col: colIndex}) : undefined}
            >
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function Game() {
  return (
    <Provider store={store}>
      <div style={{ display: 'flex' }}>
        <Board playerId={0} />
        <Board playerId={1} />
      </div>
    </Provider>)
}

export default Game
