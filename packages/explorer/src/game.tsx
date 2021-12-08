import * as React from 'react'
import {useEffect, useState} from 'react'
import { Subject } from 'rxjs'
import {Provider, useDispatch} from 'react-redux'
import { createStore, applyMiddleware } from 'redux'

import classes from './game.module.css'

import { rateLimit } from './rateLimit'

type Cell = 'stone' | 'unknown' | number | null

interface State {
  board: Cell[]
  players: string[]
  currentPlayerIndex: number
}

type Action =
  | { type: 'move', x: number, y: number }
  | { type: 'nextTurn' }

const rootReducer = (state: State, action: Action) => {
  switch (action.type) {
    case 'move':
      const board = state.board.map(cell => cell === state.currentPlayerIndex ? null : cell)
      board[action.y * 5 + action.x] = state.currentPlayerIndex
      return { ...state, board }

    case 'nextTurn':
      return { ...state, currentPlayerIndex: (state.currentPlayerIndex + 1) % 2 }
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
    0, null, null, null, null,
    null, null, null, null, null,
    null, null, null, null, null,
    null, null, null, null, null,
    null, null, null, null, 1
  ],
  players: ['Player #1', 'Player #2'],
  currentPlayerIndex: 0
},  applyMiddleware(turnFinisher))

const storeObservable = new Subject<State>()

store.subscribe(() => storeObservable.next(store.getState()))

function indexToPos(index: number) {
  return { x: index % 5, y: Math.floor(index / 5) }
}

function selectPlayer(state: State, index: number) {
  return state.players[index]
}

function selectCurrentPlayer(state: State) {
  return state.currentPlayerIndex
}

function selectBoard(state: State) {
  return state.board
}

function selectPlayerPosition(state: State, id: number) {
  const index = state.board.indexOf(id)
  return indexToPos(index)
}

function selectBoardForPlayer(state: State, id: number) {
  const { x: posX, y: posY } = selectPlayerPosition(state, id)
  return state.board.map((cell, index) => {
    const { x, y } = indexToPos(index)

    if (x === posX && y === posY) {
      return cell
    }

    if (Math.abs(x - posX) < 2 && Math.abs(y - posY) < 2) {
      return cell
    }

    return 'unknown'
  })
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

function PlayerBoard({ playerId }: { playerId?: number }) {
  const { synced, value } = useTurnBasedState()
  const player = selectPlayer(value, playerId)
  const currentPlayer = selectCurrentPlayer(value)

  const board = selectBoardForPlayer(value, playerId)

  const dispatch = useDispatch()

  const chunkedBoard = [
    board.slice(0, 5),
    board.slice(5, 10),
    board.slice(10, 15),
    board.slice(15, 20),
    board.slice(20, 25)
  ]

  const isMyTurn = synced && currentPlayer === playerId

  return (
    <div>
      <h2 className={isMyTurn ? classes.activePlayer : classes.inactivePlayer}>{player}</h2>
      {chunkedBoard.map((row, rowIndex) => (
        <div key={rowIndex} className={classes.row}>
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={[
                classes.tile,
                cell === 'unknown' ? classes.unknownTile : classes.emptyTile
              ].join(' ')}
              onClick={isMyTurn ? () => dispatch({ type: 'move', x: colIndex, y: rowIndex}) : undefined}
            >
              {cell !== 'unknown' ? cell : ''}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function Board() {
  const { value } = useTurnBasedState()
  const board = selectBoard(value)

  const chunkedBoard = [
    board.slice(0, 5),
    board.slice(5, 10),
    board.slice(10, 15),
    board.slice(15, 20),
    board.slice(20, 25)
  ]

  return (
    <div>
      <h2>Overview</h2>
      {chunkedBoard.map((row, rowIndex) => (
        <div key={rowIndex} className={classes.row}>
          {row.map((cell, colIndex) => (
            <div
              key={colIndex}
              className={[
                classes.tile,
                cell === 'unknown' ? classes.unknownTile : classes.emptyTile
              ].join(' ')}
            >
              {cell !== 'unknown' ? cell : ''}
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
        <PlayerBoard playerId={0} />
        <Board />
        <PlayerBoard playerId={1} />
      </div>
    </Provider>)
}

export default Game
