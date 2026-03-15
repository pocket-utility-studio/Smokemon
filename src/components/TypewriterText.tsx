import React, { type CSSProperties, useEffect, useRef } from 'react'
import { useTypewriter } from '../hooks/useTypewriter'

interface TypewriterTextProps {
  text: string
  speed?: number
  style?: CSSProperties
  onDone?: () => void
}

export function TypewriterText({
  text,
  speed,
  style,
  onDone,
}: TypewriterTextProps) {
  const { displayed, isDone } = useTypewriter(text, speed)
  const calledDone = useRef(false)

  useEffect(() => {
    if (isDone && !calledDone.current) {
      calledDone.current = true
      onDone?.()
    }
  }, [isDone, onDone])

  // Reset the calledDone ref when text changes so onDone fires again
  const prevText = useRef(text)
  if (prevText.current !== text) {
    prevText.current = text
    calledDone.current = false
  }

  const parts = displayed.split('\n')

  return (
    <span style={style}>
      {parts.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < parts.length - 1 && <br />}
        </React.Fragment>
      ))}
      {!isDone && <span className="gbc-blink">▌</span>}
    </span>
  )
}
