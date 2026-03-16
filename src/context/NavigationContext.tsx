import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { playSelect, playWipeTransition } from '../utils/sounds'
import { haptic } from '../utils/haptic'

type WipePhase = 'idle' | 'cover' | 'uncover'

interface NavCtx {
  transitionTo: (path: string) => void
  goBack: () => void
  wipePhase: WipePhase
}

const NavContext = createContext<NavCtx>({ transitionTo: () => {}, goBack: () => {}, wipePhase: 'idle' })

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const [wipePhase, setWipePhase] = useState<WipePhase>('idle')
  const busy = useRef(false)

  const transitionTo = useCallback((path: string) => {
    if (busy.current) return
    busy.current = true
    haptic(20)
    playSelect()
    playWipeTransition()
    setWipePhase('cover')
    setTimeout(() => {
      navigate(path)
      setWipePhase('uncover')
      setTimeout(() => {
        setWipePhase('idle')
        busy.current = false
      }, 380)
    }, 340)
  }, [navigate])

  const goBack = useCallback(() => {
    if (busy.current) return
    busy.current = true
    haptic(20)
    playSelect()
    playWipeTransition()
    setWipePhase('cover')
    setTimeout(() => {
      navigate(-1)
      setWipePhase('uncover')
      setTimeout(() => {
        setWipePhase('idle')
        busy.current = false
      }, 380)
    }, 340)
  }, [navigate])

  return (
    <NavContext.Provider value={{ transitionTo, goBack, wipePhase }}>
      {children}
    </NavContext.Provider>
  )
}

export const useTransitionNav = () => useContext(NavContext)
