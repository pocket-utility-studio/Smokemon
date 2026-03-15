import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type TimeOfDay = 'morning' | 'day' | 'night'

export interface Palette {
  bg: string
  boxBg: string
  accent: string
  text: string
  muted: string
  borderDark: string
  tint: string
}

const PALETTES: Record<TimeOfDay, Palette> = {
  morning: {
    bg: '#0e0c04',
    boxBg: '#140e06',
    accent: '#e8c840',
    text: '#f0e8a0',
    muted: '#8c7820',
    borderDark: '#4a3808',
    tint: 'rgba(255,220,80,0.04)',
  },
  day: {
    bg: '#050a04',
    boxBg: '#0a1408',
    accent: '#84cc16',
    text: '#c8e890',
    muted: '#4a7a10',
    borderDark: '#2a4a08',
    tint: 'rgba(0,0,0,0)',
  },
  night: {
    bg: '#040408',
    boxBg: '#0c0c18',
    accent: '#8080e0',
    text: '#c0b8f0',
    muted: '#505090',
    borderDark: '#282848',
    tint: 'rgba(20,10,60,0.12)',
  },
}

function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 6 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'day'
  return 'night'
}

interface TimeOfDayContextValue {
  timeOfDay: TimeOfDay
  palette: Palette
}

const TimeOfDayContext = createContext<TimeOfDayContextValue>({
  timeOfDay: 'day',
  palette: PALETTES.day,
})

export function TimeOfDayProvider({ children }: { children: ReactNode }) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(() =>
    getTimeOfDay(new Date().getHours()),
  )

  useEffect(() => {
    const tick = () => setTimeOfDay(getTimeOfDay(new Date().getHours()))
    const id = setInterval(tick, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <TimeOfDayContext.Provider value={{ timeOfDay, palette: PALETTES[timeOfDay] }}>
      {children}
    </TimeOfDayContext.Provider>
  )
}

export function useTimeOfDay(): TimeOfDayContextValue {
  return useContext(TimeOfDayContext)
}
