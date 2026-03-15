import { useEffect, useRef, useState } from 'react'

/**
 * Animates text character by character at `speed` ms per char (default 40ms).
 * Resets when `text` changes. Returns `{ displayed, isDone }`.
 */
export function useTypewriter(
  text: string,
  speed = 40,
): { displayed: string; isDone: boolean } {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Reset on text change
    setDisplayed('')
    setIsDone(false)
    indexRef.current = 0

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (text.length === 0) {
      setIsDone(true)
      return
    }

    function tick() {
      const i = indexRef.current
      if (i < text.length) {
        indexRef.current = i + 1
        setDisplayed(text.slice(0, indexRef.current))
        timerRef.current = setTimeout(tick, speed)
      } else {
        setIsDone(true)
        timerRef.current = null
      }
    }

    timerRef.current = setTimeout(tick, speed)

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [text, speed])

  return { displayed, isDone }
}
