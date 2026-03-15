const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
  borderRadius: 0,
}

const LAW_SECTIONS = [
  {
    title: 'PRIVATE USE',
    accent: '#84cc16',
    text:
      'Personal cultivation of a small number of plants at home is generally tolerated. Cannabis clubs operate in a legal gray area — privately organised, membership-based, and not formally regulated.',
  },
  {
    title: 'PUBLIC USE',
    accent: '#f59e0b',
    text:
      'Consuming or possessing cannabis in public spaces is a sanctionable civil offense under the Public Safety Law (Ley Mordaza). Administrative fines apply. It is not a criminal matter.',
  },
  {
    title: 'CANNABIS CLUBS',
    accent: '#84cc16',
    text:
      'Private, member-only associations that collectively cultivate and distribute cannabis among members. They exist in a legal gray area — tolerated in some regions but not formally regulated at a national level.',
  },
  {
    title: 'TRAFFICKING',
    accent: '#e84040',
    text:
      'Supply or sale of cannabis is a criminal offense under Article 368 of the Penal Code. This applies regardless of the quantity involved and carries custodial sentences.',
  },
]

export default function LawGuide() {
  return (
    <div style={{
      minHeight: '100%',
      background: '#050a04',
      padding: '10px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <style>{`
        @keyframes gbc-border-flash {
          0%, 49% { border-color: #e84040; }
          50%, 100% { border-color: #4a0a0a; }
        }
        .gbc-border-flash {
          animation: gbc-border-flash 0.8s step-end infinite;
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #2a4a08',
        paddingBottom: 8,
        marginBottom: 0,
      }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 13, color: '#84cc16' }}>
          LAW GUIDE
        </span>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 8,
          color: '#4a7a10',
          border: '2px solid #2a4a08',
          padding: '2px 6px',
          borderRadius: 0,
        }}>
          [ES]
        </span>
      </div>

      {/* Officer Jenny sprite + label */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <div style={{ position: 'relative', width: 48, height: 64, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Cap */}
          <div style={{
            width: 40,
            height: 14,
            background: '#2040c0',
            border: '1px solid #1030a0',
            borderRadius: 0,
            position: 'relative',
            zIndex: 2,
          }}>
            {/* Cap brim */}
            <div style={{
              position: 'absolute',
              bottom: -3,
              left: -2,
              right: -2,
              height: 3,
              background: '#1030a0',
            }} />
          </div>
          {/* Head */}
          <div style={{
            width: 32,
            height: 20,
            background: '#d4a870',
            border: '1px solid #b08850',
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            {/* Eyes */}
            <div style={{ width: 4, height: 4, background: '#301808' }} />
            <div style={{ width: 4, height: 4, background: '#301808' }} />
          </div>
          {/* Uniform */}
          <div style={{
            width: 40,
            height: 28,
            background: '#1a30a0',
            border: '1px solid #102080',
            borderRadius: 0,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Badge */}
            <div style={{
              width: 12,
              height: 10,
              background: '#f0d020',
              border: '1px solid #c0a010',
              borderRadius: 0,
              position: 'absolute',
              top: 6,
              left: '50%',
              transform: 'translateX(-50%)',
            }} />
            {/* Collar line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 2,
              height: 10,
              background: '#0e1a70',
            }} />
          </div>
          {/* Legs */}
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 14, height: 8, background: '#1a30a0', border: '1px solid #102080', borderRadius: 0 }} />
            <div style={{ width: 14, height: 8, background: '#1a30a0', border: '1px solid #102080', borderRadius: 0 }} />
          </div>
          {/* Boots */}
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{ width: 14, height: 6, background: '#181818', border: '1px solid #080808', borderRadius: 0 }} />
            <div style={{ width: 14, height: 6, background: '#181818', border: '1px solid #080808', borderRadius: 0 }} />
          </div>
        </div>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 8,
          color: '#4a7a10',
          letterSpacing: 0.5,
        }}>
          OFFICER JENNY
        </span>
      </div>

      {/* Intro poke-box */}
      <div style={{ ...pokeBox, padding: 14 }}>
        <p style={{
          fontFamily: 'monospace',
          fontSize: 12,
          color: '#c8e890',
          lineHeight: 1.7,
          margin: 0,
        }}>
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 10, color: '#84cc16', display: 'block', marginBottom: 8 }}>
            CANNABIS LAW IN SPAIN
          </span>
          Spain operates in a legal{' '}
          <span style={{ color: '#84cc16' }}>GRAY AREA</span>
          {' '}regarding cannabis. Personal cultivation and consumption in{' '}
          <span style={{ color: '#84cc16' }}>PRIVATE</span>
          {' '}spaces is generally tolerated under established case law. However, carrying cannabis in{' '}
          <span style={{ color: '#f59e0b' }}>PUBLIC</span>
          {' '}spaces is a civil — not criminal — offense, subject to administrative fines.
        </p>
      </div>

      {/* Law section cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {LAW_SECTIONS.map((section) => (
          <div key={section.title} style={{
            ...pokeBox,
            border: `3px solid ${section.accent}`,
            padding: 12,
          }}>
            <span style={{
              fontFamily: "'PokemonGb', 'Press Start 2P'",
              fontSize: 9,
              color: section.accent,
              display: 'block',
              marginBottom: 8,
              letterSpacing: 0.5,
            }}>
              {section.title}
            </span>
            <p style={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#c8e890',
              lineHeight: 1.7,
              margin: 0,
            }}>
              {section.text}
            </p>
          </div>
        ))}
      </div>

      {/* Critical warning box */}
      <div
        className="gbc-border-flash"
        style={{
          background: 'rgba(232,64,64,0.08)',
          boxShadow: 'inset 0 0 0 2px #1a0404, inset 0 0 0 4px #3a0808',
          padding: 14,
          borderRadius: 0,
          border: '3px solid #e84040',
        }}
      >
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 11,
          color: '#e84040',
          display: 'block',
          marginBottom: 10,
          letterSpacing: 0.5,
        }}>
          !! SERIOUS WARNING !!
        </span>
        <p style={{
          fontFamily: 'monospace',
          fontSize: 12,
          color: '#c8e890',
          lineHeight: 1.7,
          margin: 0,
        }}>
          Manufacturing cannabis concentrates using volatile solvents (BHO/butane extraction) is{' '}
          <span style={{ color: '#e84040' }}>NOT</span>
          {' '}the same as personal cultivation. It constitutes manufacture of a controlled substance and is treated as a{' '}
          <span style={{ color: '#e84040' }}>SERIOUS CRIMINAL OFFENSE</span>
          {' '}under Spanish law, regardless of intent.
        </p>
      </div>

      {/* Footer disclaimer */}
      <p style={{
        fontFamily: 'monospace',
        fontSize: 10,
        color: '#4a7a10',
        lineHeight: 1.6,
        margin: 0,
        textAlign: 'center',
        borderTop: '1px solid #2a4a08',
        paddingTop: 10,
      }}>
        This is educational information only, not legal advice. Laws change — always consult a qualified legal professional.
      </p>
    </div>
  )
}
