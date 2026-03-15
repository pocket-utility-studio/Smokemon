const STRIPS = 10

export default function WipeOverlay({ phase }: { phase: 'cover' | 'uncover' }) {
  return (
    <>
      <style>{`
        @keyframes wipe-in-l  { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes wipe-in-r  { from { transform: translateX(100%);  } to { transform: translateX(0); } }
        @keyframes wipe-out-l { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes wipe-out-r { from { transform: translateX(0); } to { transform: translateX(100%);  } }
      `}</style>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 200,
        pointerEvents: 'none', overflow: 'hidden',
      }}>
        {Array.from({ length: STRIPS }).map((_, i) => {
          const left = i % 2 === 0
          const anim = phase === 'cover'
            ? (left ? 'wipe-in-l' : 'wipe-in-r')
            : (left ? 'wipe-out-l' : 'wipe-out-r')
          return (
            <div key={i} style={{
              position: 'absolute',
              top: `${(i / STRIPS) * 100}%`,
              left: 0, right: 0,
              height: `${100 / STRIPS}%`,
              background: '#050a04',
              animation: `${anim} 0.32s ease-in-out both`,
              animationDelay: `${i * 0.018}s`,
            }} />
          )
        })}
      </div>
    </>
  )
}
