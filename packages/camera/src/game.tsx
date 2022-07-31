import * as React from 'react'

const rows = []
const cols = []

for (let i = 0; i < 100; i++) {
  const row = Math.floor(i / 10)
  rows.push(1)
  cols.push((i + (row % 2)) % 2)
}

const Board = React.memo(() => {
  return <div style={{ width: 100 * 50 }}>
    {rows.map((_, row) => (
      <div style={{ width: '100%', height: 50, display: 'flex'}} key={row}>
        {cols.map((value, col) => (
          <div key={col} style={{ width: 50, height: 50, background: (row + value) % 2 === 1 ? 'red' : 'blue'}}></div>
        ))}
      </div>
    ))}
  </div>
})

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

const Camera = ({ width, height, children }: { width: number, height: number, children: React.ReactNode }) => {
  const [offset, setOffset] = React.useState([0, 0])
  const ref = React.useRef<HTMLDivElement|null>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) {
      return
    }

    const contentElement = el.children[0].children[0] as HTMLElement
    const contentWidth = contentElement.offsetWidth
    const contentHeight = contentElement.offsetHeight

    let previousPos = null

    const handleMouseDown = event => {
      previousPos = { x: event.clientX, y: event.clientY }
      el.addEventListener('mousemove', handleMouseMove)
    }

    const handleMouseUp = () => {
      el.removeEventListener('mousemove', handleMouseMove)
      previousPos = null
    }

    const handleMouseMove = event => {
      if (!previousPos) {
        return
      }

      setOffset(previousOffset => [
        clamp(previousOffset[0] + event.clientX - previousPos.x, -(contentWidth - width), 0),
        clamp(previousOffset[1] + event.clientY - previousPos.y, -(contentHeight - height), 0)
      ])

      previousPos = { x: event.clientX, y: event.clientY }
    }

    const handleMouseLeave = () => {
      el.removeEventListener('mousemove', handleMouseMove)
      previousPos = null
    }

    el.addEventListener('mousedown', handleMouseDown)
    el.addEventListener('mouseup', handleMouseUp)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      el.removeEventListener('mousedown', handleMouseDown)
      el.removeEventListener('mouseup', handleMouseUp)
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [ref, setOffset, width, height])

  return (<>
    {offset[0]},{offset[1]}
    <div ref={ref} style={{ width, height, overflow: 'hidden'}}>
      <div style={{ transform: `translate(${offset[0]}px, ${offset[1]}px)` }}>
        {children}
      </div>
    </div>
  </>)
}

const Game = () => {
  return (
    <Camera width={500} height={500}>
      <Board />
    </Camera>
  )
}

export default Game
