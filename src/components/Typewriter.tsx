import { useState, useEffect } from 'react'
import { playTick } from '../utils/sounds'

interface TypewriterProps {
  text: string
  speed?: number
  onDone?: () => void
  sound?: boolean
}

export default function Typewriter({ text, speed = 38, onDone, sound = true }: TypewriterProps) {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    setShown(0)
    let i = 0
    const id = setInterval(() => {
      i++
      setShown(i)
      if (sound && text[i - 1] !== ' ') playTick()
      if (i >= text.length) {
        clearInterval(id)
        onDone?.()
      }
    }, speed)
    return () => clearInterval(id)
  }, [text])

  return (
    <span>
      {text.slice(0, shown)}
      {shown < text.length && (
        <span className="gbc-blink" style={{ marginLeft: 1 }}>▌</span>
      )}
    </span>
  )
}
