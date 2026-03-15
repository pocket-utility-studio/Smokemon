import { createContext, useContext, useState, useMemo } from 'react'
import type { ReactNode } from 'react'

export type Texture = 'matte' | 'glow'
export type Typography = 'smooth' | 'typewriter'

interface VibeContextValue {
  texture: Texture
  typography: Typography
  setTexture: (t: Texture) => void
  setTypography: (t: Typography) => void
  // Computed class strings consumed by components
  card: string
  primaryBtn: string
  font: string
  activeNav: string
}

const VibeContext = createContext<VibeContextValue | null>(null)

export function VibeProvider({ children }: { children: ReactNode }) {
  const [texture, setTexture] = useState<Texture>('matte')
  const [typography, setTypography] = useState<Typography>('smooth')

  const value = useMemo<VibeContextValue>(() => {
    const isGlow = texture === 'glow'
    const isMono = typography === 'typewriter'

    return {
      texture,
      typography,
      setTexture,
      setTypography,

      card: [
        'bg-console border-2 border-[#2a4a08] transition-shadow duration-300',
        isGlow
          ? 'shadow-[0_0_40px_rgba(132,204,22,0.1)] hover:shadow-[0_0_55px_rgba(132,204,22,0.2)]'
          : '',
      ].join(' '),

      primaryBtn: [
        'bg-cobalt text-black font-semibold px-4 py-2 transition-all duration-200 cursor-pointer border-2 border-[#4a8a10]',
        isGlow
          ? 'shadow-[0_0_22px_rgba(132,204,22,0.55)] hover:shadow-[0_0_38px_rgba(132,204,22,0.8)] hover:bg-cobalt-hover'
          : 'hover:bg-cobalt-hover',
      ].join(' '),

      font: isMono ? 'font-mono' : 'font-sans',

      activeNav: [
        'bg-cobalt text-black font-semibold',
        isGlow ? 'shadow-[0_0_15px_rgba(132,204,22,0.45)]' : '',
      ].join(' '),
    }
  }, [texture, typography])

  return <VibeContext.Provider value={value}>{children}</VibeContext.Provider>
}

export function useVibe() {
  const ctx = useContext(VibeContext)
  if (!ctx) throw new Error('useVibe must be used within VibeProvider')
  return ctx
}
