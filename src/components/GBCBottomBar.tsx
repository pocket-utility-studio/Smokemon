import { useLocation } from 'react-router-dom'
import { useTransitionNav } from '../context/NavigationContext'
import { haptic } from '../utils/haptic'

export default function GBCBottomBar() {
  const { goBack } = useTransitionNav()
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div style={{
      flexShrink: 0,
      borderTop: '2px solid #1a3004',
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      background: 'rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: isHome ? 0 : undefined,
    }}>
      {!isHome && (
        <button
          onClick={() => { haptic(20); goBack() }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            background: 'transparent',
            border: '2px solid #2a5008',
            cursor: 'pointer',
            padding: '10px 32px',
            minWidth: 78,
            marginTop: 10,
          }}
        >
          <span style={{
            fontSize: 22,
            color: '#2a5008',
            lineHeight: 1,
            fontFamily: "'PokemonGb', 'Press Start 2P'",
          }}>◄</span>
          <span style={{
            fontSize: 13,
            color: '#2a5008',
            fontFamily: "'PokemonGb', 'Press Start 2P'",
            letterSpacing: 0.5,
          }}>BACK</span>
        </button>
      )}
    </div>
  )
}
