import { createContext, useContext, useState, type ReactNode } from 'react'

const GifModeContext = createContext<{
  gifMode: boolean
  setGifMode: (v: boolean) => void
}>({ gifMode: false, setGifMode: () => {} })

export function GifModeProvider({ children }: { children: ReactNode }) {
  const [gifMode, setGifMode] = useState(false)
  return (
    <GifModeContext.Provider value={{ gifMode, setGifMode }}>
      {children}
    </GifModeContext.Provider>
  )
}

export function useGifMode() {
  return useContext(GifModeContext)
}
