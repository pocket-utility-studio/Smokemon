import { useLocation } from 'react-router-dom'
import { LayoutDashboard, BookMarked, HeartPulse, Thermometer, ChevronLeft } from 'lucide-react'
import { useTransitionNav } from '../context/NavigationContext'
import { haptic } from '../utils/haptic'

const navItems = [
  { to: '/',            icon: LayoutDashboard, label: 'HOME',  exact: true  },
  { to: '/smokedex',    icon: BookMarked,      label: 'DEX/NEW', exact: false },
  { to: '/poke-center', icon: HeartPulse,      label: 'RX',    exact: false },
  { to: '/castform',    icon: Thermometer,     label: 'TEMP',  exact: false },
]

export default function GBCBottomBar() {
  const { transitionTo, goBack } = useTransitionNav()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div style={{
      flexShrink: 0,
      borderTop: '2px solid #1a3004',
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      background: 'rgba(0,0,0,0.15)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 4px 4px' }}>
        {/* Back button — visible on any non-home page */}
        {!isHome && (
          <button
            onClick={() => { haptic(20); goBack() }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              background: 'transparent',
              border: '2px solid transparent',
              cursor: 'pointer',
              padding: '6px 14px',
              minWidth: 52,
            }}
          >
            <ChevronLeft size={24} color="#2a5008" strokeWidth={1.5} />
            <span style={{
              fontSize: 9,
              color: '#2a5008',
              fontFamily: "'PokemonGb', 'Press Start 2P'",
              letterSpacing: 0.5,
            }}>BACK</span>
          </button>
        )}

        {navItems.map(({ to, icon: Icon, label, exact }) => {
          const isActive = exact
            ? location.pathname === to
            : location.pathname.startsWith(to)
          return (
            <button
              key={to}
              onClick={() => { haptic(20); transitionTo(to) }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                background: isActive ? '#84cc16' : 'transparent',
                border: '2px solid transparent',
                cursor: 'pointer',
                padding: '6px 14px',
                minWidth: 52,
              }}
            >
              <Icon size={24} color={isActive ? '#0a1408' : '#2a5008'} strokeWidth={isActive ? 2.5 : 1.5} />
              <span style={{
                fontSize: 9,
                color: isActive ? '#0a1408' : '#2a5008',
                fontFamily: "'PokemonGb', 'Press Start 2P'",
                letterSpacing: 0.5,
              }}>{label}</span>
            </button>
          )
        })}

      </div>
    </div>
  )
}
