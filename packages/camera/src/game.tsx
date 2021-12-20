import * as React from 'react'

const rows = []
const cols = []

for (let i = 0; i < 30; i++) {
  const row = Math.floor(i / 10)
  console.log(i, row % 2)
  rows.push(1)
  cols.push((i + (row % 2)) % 2)
}

const Board = React.memo(() => {
  return <div>
    {rows.map((_, row) => (
      <div style={{ width: 100 * 50, height: 50, display: 'flex'}} key={row}>
        {cols.map((value, col) => (
          <div key={col} style={{ width: 50, height: 50, background: (row + value) % 2 === 1 ? 'red' : 'blue'}}></div>
        ))}
      </div>
    ))}
  </div>
})

const Game = () => {
  const [offset, setOffset] = React.useState([0, 0])
  const pos = React.useRef(null)

  const handleMouseDown = (e) => {
    pos.current = { x: e.clientX - offset[0], y: e.clientY - offset[1] }
  }

  const handleMouseUp = (e) => {
    pos.current = null
  }

  const handleMouseMove = (e) => {
    if (!pos.current) {
      return
    }
    setOffset([e.clientX - pos.current.x, e.clientY - pos.current.y])
  }

  return (
    <div style={{ width: 500, height: 500, overflow: 'hidden'}}>
      <div style={{ transform: `translate(${offset[0]}px, ${offset[1]}px)` }} onMouseUp={handleMouseUp} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
        <Board />
      </div>
    </div>
  )
}

export default Game
