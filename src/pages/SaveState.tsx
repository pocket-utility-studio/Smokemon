import { useRef, useState } from 'react'
import { exportSaveData, importSaveData } from '../utils/storage'
import { playSave } from '../utils/sounds'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: '#0a1408',
  borderRadius: 0,
}

const btnBase: React.CSSProperties = {
  fontFamily: "'PokemonGb', 'Press Start 2P'",
  fontSize: 10,
  padding: '11px 14px',
  cursor: 'pointer',
  borderRadius: 0,
  width: '100%',
  boxSizing: 'border-box',
  letterSpacing: 0.5,
}

const primaryBtn: React.CSSProperties = {
  ...btnBase,
  border: '3px solid #84cc16',
  color: '#84cc16',
  background: 'rgba(132,204,22,0.08)',
}

const dangerBtn: React.CSSProperties = {
  ...btnBase,
  border: '3px solid #e84040',
  color: '#e84040',
  background: 'rgba(232,64,64,0.08)',
}

type FeedbackState = 'idle' | 'saved' | 'loaded' | 'error'

export default function SaveState() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exportFeedback, setExportFeedback] = useState<FeedbackState>('idle')
  const [importFeedback, setImportFeedback] = useState<FeedbackState>('idle')
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)

  const handleExport = () => {
    if (saving) return
    setShowSaveConfirm(false)
    setSaving(true)
    setSaveProgress(0)
    playSave()
    // Animate progress bar
    const start = Date.now()
    const duration = 2000
    const tick = setInterval(() => {
      const pct = Math.min((Date.now() - start) / duration, 1)
      setSaveProgress(pct)
      if (pct >= 1) {
        clearInterval(tick)
        try { exportSaveData() } catch {}
        setExportFeedback('saved')
        setTimeout(() => {
          setSaving(false)
          setSaveProgress(0)
          setExportFeedback('idle')
        }, 500)
      }
    }, 50)
  }

  const handleLoadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string
        const parsed = JSON.parse(text)
        const success = importSaveData(parsed)
        if (success) {
          setImportFeedback('loaded')
          setTimeout(() => setImportFeedback('idle'), 2000)
        } else {
          setImportFeedback('error')
          setTimeout(() => setImportFeedback('idle'), 2500)
        }
      } catch {
        setImportFeedback('error')
        setTimeout(() => setImportFeedback('idle'), 2500)
      }
    }
    reader.readAsText(file)

    // Reset so same file can be selected again
    e.target.value = ''
  }

  const handleClearConfirm = () => {
    localStorage.removeItem('utilhub_stash')
    window.location.reload()
  }

  return (
    <div style={{
      minHeight: '100%',
      background: '#050a04',
      padding: '10px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      position: 'relative',
    }}>
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
          SAVE GAME
        </span>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P'",
          fontSize: 8,
          color: '#4a7a10',
          border: '2px solid #2a4a08',
          padding: '2px 6px',
          borderRadius: 0,
        }}>
          [DATA]
        </span>
      </div>

      {/* Export section */}
      <div style={{ ...pokeBox, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 9, color: '#84cc16', letterSpacing: 0.5 }}>
          EXPORT SAVE DATA
        </span>
        <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#c8e890', lineHeight: 1.7, margin: 0 }}>
          Download all your stash data as a .json file for safe keeping.
        </p>
        {!showSaveConfirm ? (
          <button onClick={() => setShowSaveConfirm(true)} style={primaryBtn}>
            ► SAVE GAME
          </button>
        ) : (
          <div style={{ ...pokeBox, border: '3px solid #84cc16', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 9, color: '#84cc16', textAlign: 'center', lineHeight: 1.8 }}>
              WOULD YOU LIKE TO{'\n'}SAVE THE GAME?
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleExport} style={{ ...primaryBtn, fontSize: 8 }}>► YES</button>
              <button onClick={() => setShowSaveConfirm(false)} style={{ ...btnBase, fontSize: 8, border: '3px solid #2a4a08', color: '#4a7a10', background: 'transparent' }}>► NO</button>
            </div>
          </div>
        )}
        {exportFeedback === 'saved' && (
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 8, color: '#84cc16', textAlign: 'center' }}>
            FILE DOWNLOADED
          </span>
        )}
      </div>

      {/* Import section */}
      <div style={{ ...pokeBox, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 9, color: '#84cc16', letterSpacing: 0.5 }}>
          IMPORT SAVE DATA
        </span>
        <p style={{ fontFamily: 'monospace', fontSize: 13, color: '#c8e890', lineHeight: 1.7, margin: 0 }}>
          Restore from a previously exported save file.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <button onClick={handleLoadClick} style={primaryBtn}>
          ► LOAD SAVE FILE
        </button>
        {importFeedback === 'loaded' && (
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 8, color: '#84cc16', textAlign: 'center' }}>
            LOADED!
          </span>
        )}
        {importFeedback === 'error' && (
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 8, color: '#e84040', textAlign: 'center' }}>
            ERROR: INVALID FILE
          </span>
        )}
      </div>

      {/* About section */}
      <div style={{ ...pokeBox, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 9, color: '#84cc16', letterSpacing: 0.5 }}>
          ABOUT
        </span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 11, color: '#c8e890', letterSpacing: 1 }}>
            SMOK<span style={{ fontFamily: "'Press Start 2P', monospace" }}>é</span>MON
          </span>
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 8, color: '#4a7a10' }}>
            v1.0.0
          </span>
        </div>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 7, color: '#4a7a10' }}>
          © 2026 SMOK<span style={{ fontFamily: "'Press Start 2P', monospace" }}>é</span>MON
        </span>
        <div style={{
          ...pokeBox,
          border: '2px solid #2a4a08',
          boxShadow: 'none',
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}>
          {[
            '3 CARTRIDGES INSTALLED',
            'BUILT ON REACT + VITE',
            'GBC POKEMON STYLE UI',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, background: '#84cc16', flexShrink: 0, borderRadius: 0 }} />
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#c8e890' }}>
                {item}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{
        border: '3px solid #e84040',
        background: '#0a1408',
        boxShadow: 'inset 0 0 0 2px #1a0404, inset 0 0 0 4px #3a0808',
        padding: 14,
        borderRadius: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 9, color: '#e84040', letterSpacing: 0.5 }}>
          DANGER ZONE
        </span>

        {!showConfirm ? (
          <button onClick={() => setShowConfirm(true)} style={dangerBtn}>
            ► CLEAR ALL DATA
          </button>
        ) : (
          <div style={{
            ...pokeBox,
            border: '3px solid #e84040',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            <span style={{
              fontFamily: "'PokemonGb', 'Press Start 2P'",
              fontSize: 9,
              color: '#e84040',
              textAlign: 'center',
              lineHeight: 1.7,
            }}>
              ARE YOU SURE?
            </span>
            <span style={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: '#c8e890',
              textAlign: 'center',
              lineHeight: 1.6,
            }}>
              THIS CANNOT BE UNDONE.
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleClearConfirm}
                style={{ ...dangerBtn, fontSize: 8 }}
              >
                ► YES, DELETE ALL
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{ ...primaryBtn, fontSize: 8 }}
              >
                ► CANCEL
              </button>
            </div>
          </div>
        )}
      </div>

      {saving && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: '#050a04',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 20,
        }}>
          <span className="gbc-blink" style={{
            fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 14, color: '#84cc16', textAlign: 'center',
          }}>SAVING...</span>
          <span style={{
            fontFamily: "'PokemonGb', 'Press Start 2P'", fontSize: 8, color: '#c8e890', textAlign: 'center',
          }}>DON'T TURN OFF THE POWER</span>
          <div style={{ width: '80%', height: 12, border: '3px solid #84cc16', background: '#0a1408', boxSizing: 'border-box' }}>
            <div style={{
              height: '100%',
              width: `${saveProgress * 100}%`,
              background: '#84cc16',
              transition: 'width 0.05s linear',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}
