import { createContext, useContext, useState, type ReactNode } from 'react'

export type LayoutMode = 'emulator' | 'fullscreen'

const LayoutModeContext = createContext<{
  layoutMode: LayoutMode
  setLayoutMode: (m: LayoutMode) => void
}>({ layoutMode: 'fullscreen', setLayoutMode: () => {} })

export function LayoutModeProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() =>
    sessionStorage.getItem('hasBooted') === '1' ? 'fullscreen' : 'emulator'
  )
  return (
    <LayoutModeContext.Provider value={{ layoutMode, setLayoutMode }}>
      {children}
    </LayoutModeContext.Provider>
  )
}

export function useLayoutMode() {
  return useContext(LayoutModeContext)
}
