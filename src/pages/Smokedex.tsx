import { useState, useMemo, useEffect, useRef } from 'react'
import { removeBackground } from '@imgly/background-removal'
import { compressImage } from '../utils/compressImage'
import Fuse from 'fuse.js'
import { useStash } from '../context/StashContext'
import type { StrainEntry } from '../context/StashContext'
import { useStrainDb, displayName } from '../hooks/useStrainDb'
import type { StrainRecord } from '../hooks/useStrainDb'
import { lookupStrainData, generateFourBlends } from '../services/gemini'
import type { StrainLookupResult, FourBlendResult } from '../services/gemini'
import { BudSprite, ALL_BUD_DESIGNS, getBudDesign } from '../components/BudSprite'
import type { BudContext } from '../components/BudSprite'
import BitBudCanvas from '../components/BitBudCanvas'
import StatPentagon, { deriveEffectScores } from '../components/StatPentagon'

const GBC_GREEN = '#84cc16'
const GBC_TEXT = '#c8e890'
const GBC_MUTED = '#4a7a10'
const GBC_DARKEST = '#2a4a08'
const GBC_BG = '#050a04'
const GBC_BOX = '#0a1408'
const GBC_AMBER = '#f59e0b'
const GBC_VIOLET = '#a78bfa'

const pokeBox = {
  border: '3px solid #84cc16',
  boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
  background: GBC_BOX,
}

const inputBase = {
  background: GBC_BG,
  border: `2px solid ${GBC_DARKEST}`,
  color: GBC_TEXT,
  fontFamily: 'monospace',
  fontSize: 13,
  padding: '8px',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box' as const,
}

const BALL_SPRITES: Record<string, string> = {
  sativa: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png',
  hybrid: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
  indica: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
}

function TypeSprite({ type, size = 24 }: { type?: StrainEntry['type']; size?: number }) {
  const src = BALL_SPRITES[type ?? 'hybrid'] ?? BALL_SPRITES.hybrid
  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={type ?? 'hybrid'}
      style={{ imageRendering: 'pixelated', display: 'block', flexShrink: 0 }}
    />
  )
}

function typeColor(type?: StrainEntry['type']): string {
  if (type === 'sativa') return GBC_GREEN
  if (type === 'indica') return GBC_VIOLET
  if (type === 'hybrid') return GBC_AMBER
  return GBC_MUTED
}


// ── Strain edit form ──────────────────────────────────────────────────────────

const EDIT_LABEL: React.CSSProperties = {
  fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
  fontSize: 8, color: GBC_MUTED, marginBottom: 5, display: 'block',
}

function StrainEditForm({ strain, dbContext, onSave, onCancel }: {
  strain: StrainEntry
  dbContext?: BudContext
  onSave: (updates: Partial<StrainEntry>) => void
  onCancel: () => void
}) {
  const [name,     setName]     = useState(strain.name)
  const [type,     setType]     = useState<StrainEntry['type']>(strain.type)
  const [thc,      setThc]      = useState(strain.thc?.toString() ?? '')
  const [cbd,      setCbd]      = useState(strain.cbd?.toString() ?? '')
  const [amount,   setAmount]   = useState(strain.amount ?? '')
  const [notes,    setNotes]    = useState(strain.notes ?? '')
  const [inStock,      setInStock]      = useState(strain.inStock)
  const [budDesign,    setBudDesign]    = useState(strain.budDesign ?? '')
  const [imageDataUrl, setImageDataUrl] = useState(strain.imageDataUrl ?? '')
  const [photoRemoving, setPhotoRemoving] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setPhotoRemoving(true)
    try {
      let blob: Blob = file
      try { blob = await removeBackground(file, { debug: false }) } catch { /* fall back */ }
      const url = URL.createObjectURL(blob)
      const compressed = await compressImage(url, 600, 0.8)
      URL.revokeObjectURL(url)
      setImageDataUrl(compressed)
    } finally {
      setPhotoRemoving(false)
    }
  }

  const autoDesign = getBudDesign(strain.name, strain.type, dbContext)

  const handleSave = () => {
    onSave({
      name:         name.trim() || strain.name,
      type,
      thc:          thc  ? parseFloat(thc)  : undefined,
      cbd:          cbd  ? parseFloat(cbd)  : undefined,
      amount:       amount.trim()  || undefined,
      notes:        notes.trim()   || undefined,
      inStock,
      budDesign:    budDesign    || undefined,
      imageDataUrl: imageDataUrl || undefined,
    })
  }

  const typeBtn = (t: StrainEntry['type']) => ({
    fontFamily: "'PokemonGb', 'Press Start 2P', monospace" as const,
    fontSize: 9, padding: '8px 10px', cursor: 'pointer', minHeight: 44, flex: 1,
    border: `2px solid ${type === t ? typeColor(t) : GBC_DARKEST}`,
    background: type === t ? 'rgba(132,204,22,0.1)' : 'transparent',
    color: type === t ? typeColor(t) : GBC_MUTED,
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Name */}
      <div>
        <span style={EDIT_LABEL}>NAME</span>
        <input
          type="text" value={name} onChange={(e) => setName(e.target.value)}
          style={{ ...inputBase, width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {/* Type */}
      <div>
        <span style={EDIT_LABEL}>TYPE</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['sativa', 'indica', 'hybrid'] as const).map((t) => (
            <button key={t} onClick={() => setType(type === t ? undefined : t)} style={typeBtn(t)}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* THC + CBD */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <span style={EDIT_LABEL}>THC %</span>
          <input type="number" min={0} max={100} step={0.1} value={thc}
            onChange={(e) => setThc(e.target.value)}
            style={{ ...inputBase, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <span style={EDIT_LABEL}>CBD %</span>
          <input type="number" min={0} max={100} step={0.1} value={cbd}
            onChange={(e) => setCbd(e.target.value)}
            style={{ ...inputBase, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* In Stock + Amount */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <button
          onClick={() => setInStock((v) => !v)}
          style={{
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9,
            padding: '8px 10px', minHeight: 44, cursor: 'pointer', flexShrink: 0,
            border: `2px solid ${inStock ? GBC_GREEN : GBC_DARKEST}`,
            background: inStock ? 'rgba(132,204,22,0.1)' : 'transparent',
            color: inStock ? GBC_GREEN : GBC_MUTED,
          }}
        >
          {inStock ? '● IN STOCK' : '○ OUT'}
        </button>
        <div style={{ flex: 1 }}>
          <span style={EDIT_LABEL}>AMOUNT</span>
          <input type="text" value={amount} placeholder="e.g. 3.5g"
            onChange={(e) => setAmount(e.target.value)}
            style={{ ...inputBase, width: '100%', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <span style={EDIT_LABEL}>NOTES</span>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
          style={{ ...inputBase, resize: 'none', width: '100%', boxSizing: 'border-box', lineHeight: 1.6 }}
        />
      </div>

      {/* Bud design picker */}
      <div>
        <span style={EDIT_LABEL}>BUD DESIGN</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {/* AUTO option */}
          <button
            onClick={() => setBudDesign('')}
            style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 7,
              minWidth: 44, minHeight: 44, padding: '4px 6px', cursor: 'pointer',
              border: `2px solid ${budDesign === '' ? GBC_GREEN : GBC_DARKEST}`,
              background: budDesign === '' ? 'rgba(132,204,22,0.15)' : 'transparent',
              color: budDesign === '' ? GBC_GREEN : GBC_MUTED,
            }}
          >AUTO</button>
          {/* 24 designs */}
          {ALL_BUD_DESIGNS.map((design) => (
            <button
              key={design}
              onClick={() => setBudDesign(budDesign === design ? '' : design)}
              title={design.replace(/_/g, ' ')}
              style={{
                minWidth: 44, minHeight: 44, padding: 4, cursor: 'pointer',
                border: `2px solid ${budDesign === design ? GBC_GREEN : GBC_DARKEST}`,
                background: budDesign === design ? 'rgba(132,204,22,0.15)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <BudSprite name={strain.name} type={type} size={40} budDesign={design} />
            </button>
          ))}
        </div>
        <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 7, color: GBC_MUTED, marginTop: 6 }}>
          {budDesign
            ? budDesign.replace(/_/g, ' ').toUpperCase()
            : `AUTO: ${autoDesign.replace(/_/g, ' ').toUpperCase()}`}
        </div>
      </div>

      {/* Photo */}
      <div style={{
        border: '3px solid #84cc16',
        boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
        background: '#0a1408',
        padding: 12,
      }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_MUTED, display: 'block', marginBottom: 10 }}>PHOTO</span>
        {imageDataUrl && (
          <div style={{ marginBottom: 10 }}>
            <img
              src={imageDataUrl}
              alt="bud photo"
              style={{ width: '100%', display: 'block', border: '2px solid #2a4a08' }}
            />
            <button
              onClick={() => setImageDataUrl('')}
              style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 8, marginTop: 6, padding: '6px 10px', cursor: 'pointer',
                border: '2px solid #2a4a08', color: GBC_MUTED, background: 'transparent', width: '100%',
              }}
            >► REMOVE PHOTO</button>
          </div>
        )}

        {/* Plain photo upload (bg removed) */}
        <input ref={photoInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} style={{ display: 'none' }} />
        <button
          onPointerDown={() => !photoRemoving && photoInputRef.current?.click()}
          disabled={photoRemoving}
          style={{
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8,
            padding: '10px 0', width: '100%', marginBottom: 12, cursor: photoRemoving ? 'not-allowed' : 'pointer',
            border: `2px solid ${imageDataUrl ? GBC_DARKEST : GBC_GREEN}`,
            color: photoRemoving ? GBC_MUTED : imageDataUrl ? GBC_MUTED : GBC_GREEN,
            background: 'transparent',
          }}
        >
          {photoRemoving ? '► REMOVING BG...' : imageDataUrl ? '► REPLACE PHOTO' : '► TAKE PHOTO'}
        </button>

        {/* Bit-Bud GBC dither */}
        <BitBudCanvas onCapture={(url) => setImageDataUrl(url)} />
      </div>

      {/* Save / Cancel */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleSave}
          style={{
            flex: 1, fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 11, padding: '12px 0', minHeight: 44, cursor: 'pointer',
            border: `3px solid ${GBC_GREEN}`, background: GBC_GREEN, color: GBC_BG,
            boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
          }}
        >SAVE</button>
        <button
          onClick={onCancel}
          style={{
            flex: 1, fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 11, padding: '12px 0', minHeight: 44, cursor: 'pointer',
            border: `3px solid ${GBC_DARKEST}`, background: 'transparent', color: GBC_MUTED,
          }}
        >CANCEL</button>
      </div>
    </div>
  )
}


// ── THC HP bar color ─────────────────────────────────────────────────────────
// Caps at 35% (visual max). Color shifts green → yellow → orange → purple.
function thcHpColor(thc: number | null | undefined): string {
  if (thc == null) return GBC_GREEN
  if (thc > 25)  return '#a78bfa'  // purple  — very high potency
  if (thc > 20)  return '#f97316'  // orange  — high
  if (thc >= 15) return '#f0e040'  // yellow  — moderate
  return GBC_GREEN                 // green   — mild
}

// ── Bill's PC stash list ───────────────────────────────────────────────────────

function StashList({
  strains,
  db,
  onDelete,
  onUpdate,
}: {
  strains: StrainEntry[]
  db: StrainRecord[]
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<StrainEntry>) => void
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const lookupDb = (name: string) => {
    const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    return db.find((d) => String(d.Strain).toLowerCase().replace(/[^a-z0-9]/g, '') === norm)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {strains.map((s) => {
        const dbe = lookupDb(s.name)
        const col = typeColor(s.type)
        const cbd = s.cbd ?? dbe?.cbd

        const dbCtx: BudContext | undefined = dbe ? { description: dbe.Description, effects: dbe.Effects, terpenes: dbe.terpenes, flavor: dbe.Flavor } : undefined

        return (
          <div key={s.id} style={{ ...pokeBox, padding: '14px' }}>

            {/* Row 1: sprite + name + edit/delete */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: editingId === s.id ? 14 : 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                <TypeSprite type={s.type} size={36} />
                <BudSprite name={s.name} type={s.type} size={64} context={dbCtx} budDesign={s.budDesign} />
              </div>
              <span style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 16, color: col, flex: 1, lineHeight: 1.5, wordBreak: 'break-word',
              }}>
                {s.name.toUpperCase()}
              </span>
              {confirmDeleteId === s.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_AMBER }}>MOVE TO PC?</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => { onDelete(s.id); setConfirmDeleteId(null) }}
                      style={{ background: 'transparent', border: `1px solid ${GBC_AMBER}`, color: GBC_AMBER, fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, padding: '6px 10px', cursor: 'pointer', minHeight: 44 }}>YES</button>
                    <button onClick={() => setConfirmDeleteId(null)}
                      style={{ background: 'transparent', border: `1px solid ${GBC_DARKEST}`, color: GBC_MUTED, fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, padding: '6px 10px', cursor: 'pointer', minHeight: 44 }}>NO</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => setEditingId(editingId === s.id ? null : s.id)}
                    style={{
                      background: editingId === s.id ? 'rgba(132,204,22,0.1)' : 'transparent',
                      border: `1px solid ${editingId === s.id ? GBC_GREEN : GBC_DARKEST}`,
                      color: editingId === s.id ? GBC_GREEN : GBC_MUTED,
                      fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9,
                      padding: '6px 8px', cursor: 'pointer', minWidth: 44, minHeight: 44,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >EDIT</button>
                  <button onClick={() => setConfirmDeleteId(s.id)}
                    style={{
                      background: 'transparent', border: `1px solid ${GBC_DARKEST}`, color: GBC_MUTED,
                      fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9,
                      padding: '6px 8px', cursor: 'pointer', minWidth: 44, minHeight: 44,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>[x]</button>
                </div>
              )}
            </div>

            {/* Inline edit form */}
            {editingId === s.id && (
              <StrainEditForm
                strain={s}
                dbContext={dbCtx}
                onSave={(updates) => { onUpdate(s.id, updates); setEditingId(null) }}
                onCancel={() => setEditingId(null)}
              />
            )}

            {editingId !== s.id && (<>

            {/* Row 2: type badge + stock + CBD */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              {s.type && (
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, border: `2px solid ${col}`, color: col, padding: '3px 6px' }}>
                  {s.type.toUpperCase()}
                </span>
              )}
              <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: s.inStock ? GBC_GREEN : GBC_MUTED }}>
                {s.inStock ? '● IN STOCK' : '○ OUT'}
              </span>
              {cbd != null && (
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_MUTED }}>
                  CBD {cbd}%
                </span>
              )}
            </div>

            {/* Row 4: medical uses */}
            {dbe?.medical && (
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED, lineHeight: 1.5, marginBottom: 6 }}>
                RX: {dbe.medical}
              </div>
            )}

            {/* Row 5: terpenes */}
            {dbe?.terpenes && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                {dbe.terpenes.split(/[,;]+/).map((t) => t.trim()).filter(Boolean).slice(0, 4).map((t) => (
                  <span key={t} style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '2px 5px', border: '1px solid #1e4a08', color: '#5a9a18' }}>
                    {t.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            {/* Row 6: notes */}
            {s.notes && (
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, opacity: 0.7, lineHeight: 1.5 }}>
                {s.notes}
              </div>
            )}
            </>)}
          </div>
        )
      })}
    </div>
  )
}

// ─── Party View — 2×3 grid ────────────────────────────────────────────────────

const PVSF = "'PokemonGb', 'Press Start 2P', monospace"

function PartyView({
  party,
  db,
  onDelete,
  onUpdate,
}: {
  party: StrainEntry[]
  db: StrainRecord[]
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<StrainEntry>) => void
}) {
  const [selectedId, setSelectedId]       = useState<string | null>(null)
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleSurpriseMe = () => {
    if (party.length === 0) return
    const pick = party[Math.floor(Math.random() * party.length)]
    setSelectedId(pick.id)
    setEditingId(null)
  }

  const lookupDb = (name: string) => {
    const norm = name.toLowerCase().replace(/[^a-z0-9]/g, '')
    return db.find((d) => String(d.Strain).toLowerCase().replace(/[^a-z0-9]/g, '') === norm)
  }

  const slots: (StrainEntry | null)[] = Array.from({ length: 6 }, (_, i) => party[i] ?? null)
  const selected = selectedId ? (party.find((s) => s.id === selectedId) ?? null) : null

  if (party.length === 0) {
    return (
      <div style={{ ...pokeBox, padding: '32px 12px', textAlign: 'center' }}>
        <p style={{ fontFamily: PVSF, fontSize: 11, color: GBC_MUTED }}>PARTY EMPTY</p>
        <p style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_MUTED, marginTop: 10, lineHeight: 1.6 }}>
          Mark a strain as IN STOCK to add it to your party.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* SURPRISE ME */}
      <button
        onClick={handleSurpriseMe}
        style={{
          fontFamily: PVSF, fontSize: 9, padding: '10px 0', cursor: 'pointer',
          border: '3px solid #84cc16', color: '#84cc16',
          background: 'rgba(132,204,22,0.08)', width: '100%',
          boxSizing: 'border-box', letterSpacing: 0.5,
        }}
      >★ SURPRISE ME</button>

      {/* ── 2×3 party grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {slots.map((s, i) => {
          if (!s) return (
            <div key={i} style={{
              border: '2px dashed #1a3008', background: '#050a04',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 4, minHeight: 90, opacity: 0.3,
            }}>
              <span style={{ fontFamily: PVSF, fontSize: 9, color: GBC_DARKEST }}>---</span>
              <span style={{ fontFamily: PVSF, fontSize: 7, color: GBC_DARKEST }}>EMPTY</span>
            </div>
          )

          const dbe    = lookupDb(s.name)
          const thc    = s.thc ?? dbe?.thc
          const fill   = thc != null ? Math.min(thc / 35, 1) : 0.5
          const barCol = thcHpColor(thc)
          const col    = typeColor(s.type)
          const isSel  = s.id === selectedId
          const dbCtx: BudContext | undefined = dbe
            ? { description: dbe.Description, effects: dbe.Effects, terpenes: dbe.terpenes, flavor: dbe.Flavor }
            : undefined

          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedId(isSel ? null : s.id)
                setEditingId(null)
                setConfirmDeleteId(null)
              }}
              style={{
                border: `3px solid ${isSel ? GBC_GREEN : '#2a4a08'}`,
                boxShadow: isSel
                  ? `inset 0 0 0 1px #0e1a0b, 0 0 8px rgba(132,204,22,0.2)`
                  : 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
                background: isSel ? 'rgba(132,204,22,0.07)' : '#0a1408',
                padding: '10px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 5, cursor: 'pointer', minHeight: 90, textAlign: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <TypeSprite type={s.type} size={20} />
                <BudSprite name={s.name} type={s.type} size={48} context={dbCtx} budDesign={s.budDesign} />
              </div>
              <span style={{
                fontFamily: PVSF, fontSize: 8,
                color: isSel ? GBC_GREEN : col,
                width: '100%', lineHeight: 1.5,
                wordBreak: 'break-word',
              }}>
                {s.name.toUpperCase()}
              </span>
              <div style={{ display: 'flex', gap: 2, width: '50%' }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 7,
                    background: i < Math.round(fill * 8) ? barCol : '#0a1e04',
                    border: '1px solid #1a3a08',
                    imageRendering: 'pixelated',
                  }} />
                ))}
              </div>
              <span style={{ fontFamily: PVSF, fontSize: 7, color: GBC_MUTED }}>
                {thc != null ? `THC ${thc}%` : '--'}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Selected strain detail panel ── */}
      {selected && (() => {
        const dbe    = lookupDb(selected.name)
        const col    = typeColor(selected.type)
        const dbCtx: BudContext | undefined = dbe
          ? { description: dbe.Description, effects: dbe.Effects, terpenes: dbe.terpenes, flavor: dbe.Flavor }
          : undefined
        const isEditing = selected.id === editingId
        const isConfirm = selected.id === confirmDeleteId

        return (
          <div style={{ ...pokeBox, overflow: 'hidden' }}>
            {/* Detail header row */}
            <div style={{
              padding: '10px 14px', borderBottom: `1px solid ${GBC_DARKEST}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
            }}>
              <span style={{ fontFamily: PVSF, fontSize: 12, color: col, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selected.name.toUpperCase()}
              </span>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => setEditingId(isEditing ? null : selected.id)}
                  style={{
                    background: isEditing ? 'rgba(132,204,22,0.1)' : 'transparent',
                    border: `1px solid ${isEditing ? GBC_GREEN : GBC_DARKEST}`,
                    color: isEditing ? GBC_GREEN : GBC_MUTED,
                    fontFamily: PVSF, fontSize: 9,
                    padding: '6px 8px', cursor: 'pointer', minWidth: 44, minHeight: 44,
                  }}
                >EDIT</button>
                {isConfirm ? (<>
                  <button
                    onClick={() => { onDelete(selected.id); setSelectedId(null); setConfirmDeleteId(null) }}
                    style={{ background: 'transparent', border: `1px solid ${GBC_AMBER}`, color: GBC_AMBER, fontFamily: PVSF, fontSize: 9, padding: '6px 10px', cursor: 'pointer', minHeight: 44 }}
                  >YES</button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    style={{ background: 'transparent', border: `1px solid ${GBC_DARKEST}`, color: GBC_MUTED, fontFamily: PVSF, fontSize: 9, padding: '6px 10px', cursor: 'pointer', minHeight: 44 }}
                  >NO</button>
                </>) : (
                  <button
                    onClick={() => setConfirmDeleteId(selected.id)}
                    style={{ background: 'transparent', border: `1px solid ${GBC_DARKEST}`, color: GBC_MUTED, fontFamily: PVSF, fontSize: 9, padding: '6px 8px', cursor: 'pointer', minWidth: 44, minHeight: 44 }}
                  >[x]</button>
                )}
              </div>
            </div>

            {/* Detail body */}
            <div style={{ padding: '12px 14px' }}>
              {isEditing ? (
                <StrainEditForm
                  strain={selected}
                  dbContext={dbCtx}
                  onSave={(updates) => { onUpdate(selected.id, updates); setEditingId(null) }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (<>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                  {selected.type && (
                    <span style={{ fontFamily: PVSF, fontSize: 9, border: `2px solid ${col}`, color: col, padding: '2px 6px' }}>
                      {selected.type.toUpperCase()}
                    </span>
                  )}
                  {selected.amount && (
                    <span style={{ fontFamily: PVSF, fontSize: 9, color: GBC_MUTED }}>{selected.amount.toUpperCase()}</span>
                  )}
                </div>
                {(selected.cbd ?? dbe?.cbd) != null && (
                  <div style={{ fontFamily: PVSF, fontSize: 10, color: GBC_MUTED, marginBottom: 8 }}>CBD {selected.cbd ?? dbe?.cbd}%</div>
                )}
                {dbe?.terpenes && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: PVSF, fontSize: 10, color: GBC_MUTED, marginBottom: 4 }}>TERPENES</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {dbe.terpenes.split(/[,;]+/).map((t) => t.trim()).filter(Boolean).map((t) => (
                        <span key={t} style={{ fontFamily: PVSF, fontSize: 8, padding: '2px 5px', border: '1px solid #1e4a08', color: '#5a9a18' }}>{t.toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                )}
                {/* Stat Pentagon */}
                <div style={{ marginBottom: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontFamily: PVSF, fontSize: 10, color: GBC_MUTED }}>STAT PENTAGON</div>
                  <StatPentagon
                    scores={deriveEffectScores(dbe?.Effects, selected.type)}
                    color={typeColor(selected.type)}
                    size={130}
                  />
                </div>

                {dbe?.Effects && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: PVSF, fontSize: 10, color: GBC_MUTED, marginBottom: 4 }}>EFFECTS</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 14, color: GBC_TEXT, lineHeight: 1.5 }}>{dbe.Effects}</div>
                  </div>
                )}
                {dbe?.medical && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: PVSF, fontSize: 10, color: GBC_MUTED, marginBottom: 4 }}>MEDICAL</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 14, color: GBC_MUTED, lineHeight: 1.5 }}>{dbe.medical}</div>
                  </div>
                )}
                {dbe?.Description && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: PVSF, fontSize: 10, color: GBC_MUTED, marginBottom: 4 }}>ABOUT</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 14, color: GBC_TEXT, lineHeight: 1.6 }}>{dbe.Description}</div>
                  </div>
                )}
                {dbe?.Flavor && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: PVSF, fontSize: 10, color: GBC_MUTED, marginBottom: 4 }}>FLAVOR</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 14, color: GBC_TEXT, lineHeight: 1.5 }}>{dbe.Flavor}</div>
                  </div>
                )}
                {selected.notes && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontFamily: PVSF, fontSize: 10, color: GBC_MUTED, marginBottom: 4 }}>NOTES</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 14, color: GBC_TEXT, opacity: 0.7, lineHeight: 1.5 }}>{selected.notes}</div>
                  </div>
                )}
              </>)}
            </div>
          </div>
        )
      })()}

      {party.length >= 6 && (
        <div style={{ fontFamily: PVSF, fontSize: 9, color: GBC_AMBER, textAlign: 'center', padding: '6px 0' }}>
          PARTY FULL (6/6)
        </div>
      )}

      {party.length >= 2 && <StrainMixer party={party} db={db} />}

    </div>
  )
}

// ─── Strain Mixer ─────────────────────────────────────────────────────────────

const SPINNER_COUNT = 12

function CircleSpinner() {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % SPINNER_COUNT), 80)
    return () => clearInterval(id)
  }, [])

  const SIZE = 56   // outer container px
  const R    = 22   // radius from centre to dot centre
  const DOT  = 7    // dot square size

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }}>
      {Array.from({ length: SPINNER_COUNT }, (_, i) => {
        const angle = (i / SPINNER_COUNT) * 2 * Math.PI - Math.PI / 2
        const cx = SIZE / 2 + R * Math.cos(angle) - DOT / 2
        const cy = SIZE / 2 + R * Math.sin(angle) - DOT / 2
        const deg = (i / SPINNER_COUNT) * 360
        // age: how far behind the head this dot is (0 = head, 11 = tail)
        const age = (frame - i + SPINNER_COUNT) % SPINNER_COUNT
        const opacity = age === 0 ? 1
          : age === 1 ? 0.75
          : age === 2 ? 0.55
          : age === 3 ? 0.38
          : age === 4 ? 0.24
          : 0.1
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: cx, top: cy,
              width: DOT, height: DOT,
              background: GBC_AMBER,
              opacity,
              transform: `rotate(${deg}deg)`,
            }}
          />
        )
      })}
    </div>
  )
}

const MIXER_LABELS: Record<keyof FourBlendResult, { color: string; icon: string }> = {
  taste:    { color: GBC_AMBER,  icon: '★' },
  euphoric: { color: GBC_GREEN,  icon: '▲' },
  relax:    { color: GBC_VIOLET, icon: '●' },
  wildcard: { color: '#f06090',  icon: '◆' },
}

function StrainMixer({ party, db }: { party: StrainEntry[]; db: StrainRecord[] }) {
  const [result, setResult] = useState<FourBlendResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const normName = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const findDb = (name: string) => db.find((d) => normName(String(d.Strain)) === normName(name))

  const enrichedParty = party.map((s) => {
    const d = findDb(s.name)
    return { name: s.name, type: s.type ?? d?.Type, thc: s.thc ?? d?.thc, cbd: s.cbd ?? d?.cbd, terpenes: d?.terpenes, effects: d?.Effects, medical: d?.medical }
  })

  const handleGet = async () => {
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const r = await generateFourBlends(enrichedParty)
      setResult(r)
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setError(msg === 'NO_KEY' ? 'SET API KEY IN SMOKÉ CENTER FIRST' : 'AI ERROR — TRY AGAIN')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ border: `3px solid ${GBC_AMBER}`, boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a2c00', background: '#0a0900', padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span style={{ fontFamily: PVSF, fontSize: 9, color: GBC_AMBER, letterSpacing: 0.5 }}>STRAIN MIXER</span>
      <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_MUTED, lineHeight: 1.6, margin: 0 }}>
        Prof T-Oak will suggest four blends from your party — taste, euphoric, relax, and a wild card.
      </p>

      <button
        onClick={handleGet}
        disabled={loading}
        style={{
          fontFamily: PVSF, fontSize: 10, padding: '12px 0', width: '100%',
          cursor: loading ? 'default' : 'pointer',
          border: `3px solid ${loading ? GBC_DARKEST : GBC_AMBER}`,
          color: loading ? GBC_MUTED : GBC_AMBER,
          background: loading ? 'transparent' : 'rgba(245,158,11,0.08)',
          boxSizing: 'border-box',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}
      >
        {loading ? <><CircleSpinner /><span style={{ fontFamily: PVSF, fontSize: 9 }}>ASKING PROF T-OAK...</span></> : '► GET SUGGESTIONS'}
      </button>

      {error && (
        <span style={{ fontFamily: PVSF, fontSize: 8, color: '#e84040' }}>{error}</span>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(Object.keys(result) as (keyof FourBlendResult)[]).map((key) => {
            const card = result[key]
            const { color, icon } = MIXER_LABELS[key]
            return (
              <div key={key} style={{ border: `2px solid ${color}`, background: '#060d05', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: PVSF, fontSize: 8, color }}>{icon} {card.label}</span>
                </div>
                <span style={{ fontFamily: PVSF, fontSize: 9, color: GBC_TEXT, lineHeight: 1.6 }}>
                  {card.strainA.toUpperCase()} + {card.strainB.toUpperCase()}
                </span>
                <p style={{ fontFamily: 'monospace', fontSize: 12, color: GBC_TEXT, lineHeight: 1.7, margin: 0, opacity: 0.85 }}>
                  {card.reason}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Strain Dex ──────────────────────────────────────────────────────────────

type DexCategory = {
  label: string
  color: string
  filter: (s: StrainRecord) => boolean
}

const DEX_CATEGORIES: DexCategory[] = [
  { label: 'ALL',       color: GBC_GREEN,  filter: () => true },
  { label: 'DAYTIME',   color: '#f0e040',  filter: (s) => /energetic|uplifted|tingly|alert/i.test(s.Effects) },
  { label: 'NIGHTTIME', color: GBC_VIOLET, filter: (s) => /sleepy|drowsy/i.test(s.Effects) },
  { label: 'RELAXED',   color: '#60c8f0',  filter: (s) => /relaxed|calm/i.test(s.Effects) },
  { label: 'CREATIVE',  color: GBC_AMBER,  filter: (s) => /creative/i.test(s.Effects) },
  { label: 'FOCUSED',   color: '#a0e860',  filter: (s) => /focused|clear-headed/i.test(s.Effects) },
  { label: 'SOCIAL',    color: '#f080c0',  filter: (s) => /talkative|giggly/i.test(s.Effects) },
  { label: 'PAIN',      color: '#e06060',  filter: (s) => /pain/i.test(s.medical || '') },
  { label: 'ANXIETY',   color: '#c0a0f0',  filter: (s) => /anxiety|stress/i.test(s.medical || '') },
  { label: 'SLEEP',     color: '#8080f0',  filter: (s) => /insomnia|sleep/i.test(s.medical || '') },
  { label: 'MYRCENE',   color: '#5a9a18',  filter: (s) => /myrcene/i.test(s.terpenes || '') || (/relaxed/i.test(s.Effects) && /sleepy/i.test(s.Effects)) },
  { label: 'LIMONENE',  color: '#e8d020',  filter: (s) => /limonene/i.test(s.terpenes || '') || (/uplifted/i.test(s.Effects) && /happy/i.test(s.Effects) && /energetic/i.test(s.Effects)) },
  { label: 'PINENE',    color: '#40c880',  filter: (s) => /pinene/i.test(s.terpenes || '') || (/focused/i.test(s.Effects) && /energetic/i.test(s.Effects)) },
]

// ── Strain detail view ────────────────────────────────────────────────────────

const PAGE_SIZE = 20
type SortKey = 'popular' | 'az' | 'thc' | 'rating'

// Curated popularity order — first 4 pages (80 strains) show these first, then A-Z
const POPULAR_STRAINS: string[] = [
  'OG Kush', 'Blue Dream', 'Sour Diesel', 'Girl Scout Cookies', 'Jack Herer',
  'White Widow', 'AK-47', 'Northern Lights', 'Gelato', 'Gorilla Glue #4',
  'Pineapple Express', 'Granddaddy Purple', 'Purple Haze', 'Super Silver Haze',
  'Trainwreck', 'Blueberry', 'Amnesia Haze', 'Cheese', 'Skunk #1', 'Bubba Kush',
  'Strawberry Cough', 'Durban Poison', 'Hindu Kush', 'Wedding Cake', 'Runtz',
  'Do-Si-Dos', 'Bruce Banner', 'Zkittlez', 'Tangie', 'Gelato 41',
  'Green Crack', 'LA Confidential', 'Lemon Haze', 'Maui Wowie', 'NYC Diesel',
  'Purple Kush', 'Super Lemon Haze', 'Animal Cookies', 'Chemdawg', 'Fire OG',
  'Grapefruit', 'Harlequin', 'Jack the Ripper', 'Lemon OG', 'Obama Kush',
  'Skywalker OG', 'Sunset Sherbet', 'White Fire OG', 'Chocolope', 'Gushers',
  'Biscotti', 'MAC 1', 'Triangle Kush', 'Platinum OG', 'Lemon Skunk',
  'Strawberry Banana', 'Blue Cheese', 'Cherry Pie', 'Headband', 'Mimosa',
  'Ice Cream Cake', 'Alien OG', 'Critical Mass', 'Death Star', 'Forbidden Fruit',
  'Tropicana Cookies', 'Blue Cookies', 'Sour OG', 'Larry Bird', 'Papaya',
  'Sherbet', 'Pink Kush', 'Black Diamond', 'Banana OG', 'Cookies and Cream',
  'Cereal Milk', 'Jealousy', 'Gary Payton', 'London Pound Cake', 'Purple Punch',
]

function popularityRank(name: string): number {
  const lower = name.toLowerCase()
  const idx = POPULAR_STRAINS.findIndex((p) => p.toLowerCase() === lower)
  return idx === -1 ? Infinity : idx
}


function StrainDetail({ strain, onBack }: { strain: StrainRecord; onBack: () => void }) {
  const { strains, addStrain } = useStash()
  const [added, setAdded] = useState(false)
  const col = strain.Type === 'sativa' ? GBC_GREEN : strain.Type === 'indica' ? GBC_VIOLET : GBC_AMBER
  const LABEL: React.CSSProperties = { fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_MUTED, display: 'block', marginBottom: 4 }
  const VALUE: React.CSSProperties = { fontFamily: 'monospace', fontSize: 14, color: GBC_TEXT, lineHeight: 1.6 }

  const effects = strain.Effects ? strain.Effects.split(',').map((e) => e.trim()).filter(Boolean) : []
  const flavors = strain.Flavor ? strain.Flavor.split(',').map((f) => f.trim()).filter(Boolean) : []
  const terpenes = strain.terpenes ? strain.terpenes.split(/[,;]+/).map((t) => t.trim()).filter(Boolean) : []

  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')
  const alreadyInStash = strains.some((s) => norm(s.name) === norm(displayName(strain)))

  const handleAdd = () => {
    addStrain({
      name: displayName(strain),
      type: strain.Type as StrainEntry['type'],
      thc: strain.thc ?? undefined,
      cbd: strain.cbd ?? undefined,
      inStock: true,
    })
    setAdded(true)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Back + name header */}
      <div style={{ ...pokeBox, padding: '10px 12px' }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: GBC_MUTED, fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, cursor: 'pointer', padding: 0, marginBottom: 8, display: 'block' }}
        >
          ◄ BACK
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 13, color: col, flex: 1, lineHeight: 1.6, wordBreak: 'break-word' }}>
            {displayName(strain)}
          </span>
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, border: `2px solid ${col}`, color: col, padding: '4px 8px', flexShrink: 0 }}>
            {strain.Type.toUpperCase()}
          </span>
        </div>
        {strain.Rating != null && (
          <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_AMBER, marginBottom: 10 }}>
            {'★'.repeat(Math.round(strain.Rating))}{'☆'.repeat(5 - Math.round(strain.Rating))} {strain.Rating}/5
          </div>
        )}
        {/* Add to stash */}
        {alreadyInStash || added ? (
          <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_GREEN, padding: '8px 0' }}>
            [{added && !alreadyInStash ? 'ADDED!' : 'IN STASH'}]
          </div>
        ) : (
          <button
            onClick={handleAdd}
            style={{
              width: '100%', fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 10,
              padding: '12px 0', cursor: 'pointer',
              background: GBC_GREEN, color: GBC_BG,
              border: `3px solid ${GBC_GREEN}`,
              boxShadow: 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
            }}
          >
            + ADD TO STASH
          </button>
        )}
      </div>

      {/* THC / CBD */}
      {(strain.thc != null || strain.cbd != null) && (
        <div style={{ ...pokeBox, padding: '10px 12px' }}>
          <span style={LABEL}>CANNABINOIDS</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {strain.thc != null && (
              <div>
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_AMBER }}>THC</span>
                <div style={{ fontFamily: 'monospace', fontSize: 20, color: GBC_TEXT }}>{strain.thc}%</div>
              </div>
            )}
            {strain.cbd != null && (
              <div>
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_VIOLET }}>CBD</span>
                <div style={{ fontFamily: 'monospace', fontSize: 20, color: GBC_TEXT }}>{strain.cbd}%</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Effects */}
      {effects.length > 0 && (
        <div style={{ ...pokeBox, padding: '10px 12px' }}>
          <span style={LABEL}>EFFECTS</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {effects.map((e) => (
              <span key={e} style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '4px 8px', border: `1px solid ${col}`, color: col }}>
                {e.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Flavors */}
      {flavors.length > 0 && (
        <div style={{ ...pokeBox, padding: '10px 12px' }}>
          <span style={LABEL}>FLAVORS</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {flavors.map((f) => (
              <span key={f} style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '4px 8px', border: '1px solid #3a5010', color: GBC_MUTED }}>
                {f.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Terpenes */}
      {terpenes.length > 0 && (
        <div style={{ ...pokeBox, padding: '10px 12px' }}>
          <span style={LABEL}>TERPENES</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {terpenes.map((t) => (
              <span key={t} style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '4px 8px', border: '1px solid #1e4a08', color: '#5a9a18' }}>
                {t.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Medical */}
      {strain.medical && (
        <div style={{ ...pokeBox, padding: '10px 12px' }}>
          <span style={LABEL}>MEDICAL USES</span>
          <span style={VALUE}>{strain.medical}</span>
        </div>
      )}

      {/* Description */}
      {strain.Description && (
        <div style={{ ...pokeBox, padding: '10px 12px' }}>
          <span style={LABEL}>DESCRIPTION</span>
          <span style={{ ...VALUE, fontSize: 13, opacity: 0.85 }}>{strain.Description}</span>
        </div>
      )}
    </div>
  )
}

// ── Dex list ──────────────────────────────────────────────────────────────────

function StrainDex({ db }: { db: StrainRecord[] }) {
  const { addStrain, strains } = useStash()
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [category, setCategory] = useState<DexCategory>(DEX_CATEGORIES[0])
  const [selected, setSelected] = useState<StrainRecord | null>(null)
  const [sort, setSort] = useState<SortKey>('popular')
  const [page, setPage] = useState(0)
  const [geminiResult, setGeminiResult] = useState<(StrainLookupResult & { name: string }) | null>(null)
  const [geminiLoading, setGeminiLoading] = useState(false)
  const [geminiError, setGeminiError] = useState('')
  const [geminiAdded, setGeminiAdded] = useState(false)

  const fetchFromGemini = async () => {
    const name = query.trim()
    if (!name || geminiLoading) return
    setGeminiLoading(true)
    setGeminiError('')
    setGeminiResult(null)
    setGeminiAdded(false)
    try {
      const data = await lookupStrainData(name)
      setGeminiResult({ ...data, name })
    } catch (e) {
      const msg = e instanceof Error ? e.message : ''
      setGeminiError(msg === 'NO_KEY' ? 'SET API KEY IN SMOKÉ CENTER FIRST' : 'GEMINI LOOKUP FAILED')
    } finally {
      setGeminiLoading(false)
    }
  }

  const addGeminiToStash = () => {
    if (!geminiResult) return
    addStrain({
      name: geminiResult.name,
      type: geminiResult.type,
      thc:  geminiResult.thc,
      cbd:  geminiResult.cbd,
      notes: [
        geminiResult.effects  ? `Effects: ${geminiResult.effects}` : '',
        geminiResult.terpenes ? `Terpenes: ${geminiResult.terpenes}` : '',
        geminiResult.history  ? `History: ${geminiResult.history}` : '',
      ].filter(Boolean).join('\n') || undefined,
      inStock: true,
    })
    setGeminiAdded(true)
  }

  // Reset to page 0 and clear Gemini result whenever search/filter/sort changes
  useEffect(() => {
    setPage(0)
    setGeminiResult(null)
    setGeminiError('')
    setGeminiAdded(false)
  }, [query, category, sort])

  const fuse = useMemo(() => new Fuse(db, {
    keys: [
      { name: 'Strain',      weight: 3 },
      { name: 'Effects',     weight: 1.5 },
      { name: 'terpenes',    weight: 1.2 },
      { name: 'Flavor',      weight: 1 },
      { name: 'Description', weight: 0.8 },
      { name: 'medical',     weight: 0.8 },
      { name: 'Type',        weight: 0.5 },
    ],
    threshold: 0.4,       // 0 = exact, 1 = match anything — 0.4 is forgiving of typos
    distance: 200,
    includeScore: true,
    useExtendedSearch: false,
  }), [db])

  const { pageResults, total, totalPages } = useMemo(() => {
    let pool = db.filter(category.filter)

    if (query.trim()) {
      const fuseResults = fuse.search(query.trim())
      // Filter to category and preserve Fuse relevance order
      const inCategory = new Set(pool.map((s) => s.Strain))
      pool = fuseResults
        .filter(({ item }) => inCategory.has(item.Strain))
        .map(({ item }) => item)
    } else {
      pool = [...pool]
      if (sort === 'popular') pool.sort((a, b) => {
        const ra = popularityRank(displayName(a)), rb = popularityRank(displayName(b))
        if (ra !== rb) return ra - rb
        return displayName(a).localeCompare(displayName(b))
      })
      if (sort === 'az')     pool.sort((a, b) => displayName(a).localeCompare(displayName(b)))
      if (sort === 'thc')    pool.sort((a, b) => (b.thc ?? 0) - (a.thc ?? 0))
      if (sort === 'rating') pool.sort((a, b) => (b.Rating ?? 0) - (a.Rating ?? 0))
    }

    const total = pool.length
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1
    const pageResults = pool.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
    return { pageResults, total, totalPages }
  }, [db, fuse, query, category, sort, page])

  if (selected) {
    return <StrainDetail strain={selected} onBack={() => setSelected(null)} />
  }

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'popular', label: 'POPULAR' },
    { key: 'az',      label: 'A-Z' },
    { key: 'thc',     label: 'THC' },
    { key: 'rating',  label: 'RATING' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Search */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="OG Kush, sleepy, myrcene..."
        style={{
          background: '#050a04',
          border: `2px solid ${focused ? '#4a8a10' : GBC_DARKEST}`,
          color: GBC_TEXT,
          fontFamily: 'monospace',
          fontSize: 16,
          padding: '14px 12px',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {/* Sort — hidden when actively searching (results sorted by relevance) */}
      {!query.trim() && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 7, color: GBC_MUTED, flexShrink: 0 }}>
            SORT:
          </span>
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 8, padding: '6px 10px', minHeight: 36,
                border: `2px solid ${sort === opt.key ? GBC_GREEN : GBC_DARKEST}`,
                background: sort === opt.key ? 'rgba(132,204,22,0.12)' : 'transparent',
                color: sort === opt.key ? GBC_GREEN : GBC_MUTED,
                cursor: 'pointer',
              }}
            >
              {opt.label}{sort === opt.key && opt.key !== 'az' ? ' ▼' : ''}
            </button>
          ))}
        </div>
      )}

      {/* Category chips */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' as const }}>
        {DEX_CATEGORIES.map((cat) => {
          const active = cat.label === category.label
          return (
            <button
              key={cat.label}
              onClick={() => setCategory(cat)}
              style={{
                fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                fontSize: 9, padding: '8px 12px',
                border: `2px solid ${active ? cat.color : GBC_DARKEST}`,
                background: active ? `rgba(${cat.color === GBC_GREEN ? '132,204,22' : '80,80,80'},0.15)` : 'transparent',
                color: active ? cat.color : GBC_MUTED,
                cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, minHeight: 44,
                WebkitTapHighlightColor: 'transparent' as unknown as string,
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Count + page indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_MUTED }}>
          {total} STRAINS{category.label !== 'ALL' ? ` · ${category.label}` : ''}
          {query.trim() ? ' · BY MATCH' : ''}
        </span>
        {totalPages > 1 && (
          <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_MUTED }}>
            PG {page + 1}/{totalPages}
          </span>
        )}
      </div>

      {/* Gemini search — always available when a query is entered */}
      {query.trim() && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            onClick={fetchFromGemini}
            disabled={geminiLoading}
            style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
              fontSize: 9, padding: '10px 14px', width: '100%', minHeight: 44,
              border: `2px solid ${geminiLoading ? GBC_DARKEST : GBC_VIOLET}`,
              background: geminiLoading ? 'rgba(167,139,250,0.05)' : 'rgba(167,139,250,0.08)',
              color: geminiLoading ? GBC_DARKEST : GBC_VIOLET,
              cursor: geminiLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {geminiLoading ? '► SEARCHING GEMINI...' : '► SEARCH WITH GEMINI'}
          </button>
          {geminiError && (
            <p style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: '#e84040', margin: 0, lineHeight: 1.8 }}>
              {geminiError}
            </p>
          )}
          {geminiResult && (() => {
            const col = geminiResult.type === 'sativa' ? GBC_GREEN : geminiResult.type === 'indica' ? GBC_VIOLET : GBC_AMBER
            const alreadyInStash = strains.some(s => s.name.toLowerCase() === geminiResult.name.toLowerCase())
            return (
              <div style={{ ...pokeBox, border: `3px solid ${GBC_VIOLET}`, padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 7, color: GBC_VIOLET, marginBottom: 2 }}>
                  GEMINI RESULT
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 13, color: col, flex: 1, lineHeight: 1.6, wordBreak: 'break-word' }}>
                    {geminiResult.name.toUpperCase()}
                  </span>
                  {geminiResult.type && (
                    <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, border: `2px solid ${col}`, color: col, padding: '3px 6px', flexShrink: 0 }}>
                      {geminiResult.type.toUpperCase()}
                    </span>
                  )}
                </div>
                {(geminiResult.thc != null || geminiResult.cbd != null) && (
                  <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_MUTED }}>
                    {geminiResult.thc != null ? `THC ${geminiResult.thc}%` : ''}
                    {geminiResult.thc != null && geminiResult.cbd != null ? '  ·  ' : ''}
                    {geminiResult.cbd != null ? `CBD ${geminiResult.cbd}%` : ''}
                    <span style={{ fontSize: 7, color: GBC_DARKEST, marginLeft: 8 }}>[AI EST.]</span>
                  </div>
                )}
                {geminiResult.terpenes && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {geminiResult.terpenes.split(/[,;]+/).map(t => t.trim()).filter(Boolean).map(t => (
                      <span key={t} style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '2px 5px', border: '1px solid #1e4a08', color: '#5a9a18' }}>
                        {t.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
                {geminiResult.effects && (
                  <p style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_TEXT, lineHeight: 1.7, margin: 0 }}>
                    {geminiResult.effects}
                  </p>
                )}
                {geminiResult.history && (
                  <div style={{ borderTop: `1px solid ${GBC_DARKEST}`, paddingTop: 10 }}>
                    <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 7, color: GBC_MUTED, marginBottom: 6 }}>
                      STRAIN HISTORY
                    </div>
                    <p style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_TEXT, lineHeight: 1.8, margin: 0, opacity: 0.85 }}>
                      {geminiResult.history}
                    </p>
                  </div>
                )}
                <button
                  onClick={addGeminiToStash}
                  disabled={alreadyInStash || geminiAdded}
                  style={{
                    fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
                    fontSize: 10, padding: '12px 0', width: '100%', minHeight: 44,
                    border: `3px solid ${alreadyInStash || geminiAdded ? GBC_DARKEST : GBC_GREEN}`,
                    background: alreadyInStash || geminiAdded ? 'transparent' : GBC_GREEN,
                    color: alreadyInStash || geminiAdded ? GBC_MUTED : GBC_BG,
                    cursor: alreadyInStash || geminiAdded ? 'not-allowed' : 'pointer',
                    boxShadow: alreadyInStash || geminiAdded ? 'none' : 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010',
                  }}
                >
                  {geminiAdded ? 'ADDED!' : alreadyInStash ? 'ALREADY IN STASH' : '+ ADD TO STASH'}
                </button>
              </div>
            )
          })()}
        </div>
      )}

      {/* Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {pageResults.length === 0 && (
          <div style={{ ...pokeBox, padding: '16px 14px' }}>
            <p style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_MUTED, margin: 0 }}>
              NOT IN LOCAL DEX
            </p>
          </div>
        )}
        {pageResults.map((s) => {
          const col = s.Type === 'sativa' ? GBC_GREEN : s.Type === 'indica' ? GBC_VIOLET : GBC_AMBER
          return (
            <button
              key={s.Strain}
              onClick={() => setSelected(s)}
              style={{
                ...pokeBox, padding: '12px', cursor: 'pointer',
                background: GBC_BOX, border: '3px solid #84cc16',
                width: '100%', textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 15, color: col, flex: 1, lineHeight: 1.6, wordBreak: 'break-word' }}>
                  {displayName(s)}
                </span>
                <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, border: `2px solid ${col}`, color: col, padding: '3px 6px', flexShrink: 0 }}>
                  {s.Type.toUpperCase()}
                </span>
              </div>
              {(s.thc != null || s.cbd != null) && (
                <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_MUTED, marginBottom: 6 }}>
                  {s.thc != null ? `THC ${s.thc}%` : ''}{s.thc != null && s.cbd != null ? '  ·  ' : ''}{s.cbd != null ? `CBD ${s.cbd}%` : ''}
                </div>
              )}
              {s.Rating != null && (
                <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_AMBER, marginBottom: 6 }}>
                  {'★'.repeat(Math.round(s.Rating))}{'☆'.repeat(5 - Math.round(s.Rating))}
                </div>
              )}
              {s.terpenes && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                  {s.terpenes.split(/[,;]+/).map((t) => t.trim()).filter(Boolean).slice(0, 3).map((t) => (
                    <span key={t} style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '2px 5px', border: '1px solid #1e4a08', color: '#5a9a18' }}>
                      {t.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_TEXT, opacity: 0.6, lineHeight: 1.5 }}>
                {s.Effects.split(',').map((e) => e.trim()).slice(0, 4).join(' · ')}
              </div>
              <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 7, color: GBC_MUTED, marginTop: 6, textAlign: 'right' }}>
                TAP FOR FULL INFO ►
              </div>
            </button>
          )
        })}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', paddingTop: 4 }}>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9,
              padding: '10px 16px', minHeight: 44, cursor: page === 0 ? 'not-allowed' : 'pointer',
              border: `2px solid ${page === 0 ? GBC_DARKEST : GBC_MUTED}`,
              background: 'transparent',
              color: page === 0 ? GBC_DARKEST : GBC_MUTED,
            }}
          >
            ◄ PREV
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            style={{
              fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9,
              padding: '10px 16px', minHeight: 44, cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer',
              border: `2px solid ${page === totalPages - 1 ? GBC_DARKEST : GBC_MUTED}`,
              background: 'transparent',
              color: page === totalPages - 1 ? GBC_DARKEST : GBC_MUTED,
            }}
          >
            NEXT ►
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Smokedex() {
  const { strains, updateStrain, deleteStrain } = useStash()
  const { db } = useStrainDb()
  const [tab, setTab] = useState<'party' | 'pc' | 'dex'>('party')
  const [confirmPurge, setConfirmPurge] = useState(false)

  const party = strains.filter((s) => s.inStock)

  const tabBtn = (active: boolean) => ({
    fontFamily: "'PokemonGb', 'Press Start 2P', monospace" as const,
    fontSize: 10,
    padding: '8px 14px',
    border: active ? `3px solid ${GBC_GREEN}` : `3px solid ${GBC_DARKEST}`,
    background: active ? 'rgba(132,204,22,0.10)' : 'transparent',
    color: active ? GBC_GREEN : GBC_MUTED,
    cursor: 'pointer',
    boxShadow: active ? 'inset 0 0 0 2px #0e1a0b, inset 0 0 0 4px #3a6010' : 'none',
  })

  return (
    <div style={{
      minHeight: '100%',
      padding: '10px',
      background: GBC_BG,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxSizing: 'border-box',
    }}>

      {/* Header */}
      <div style={{
        ...pokeBox,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
          fontSize: 13,
          color: GBC_GREEN,
        }}>
          SMOK<span style={{ fontFamily: "'Press Start 2P', monospace" }}>É</span>DEX
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
          <span style={{
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 8,
            color: GBC_MUTED,
            border: `1px solid ${GBC_MUTED}`,
            padding: '2px 6px',
          }}>
            [DEX]
          </span>
          <span style={{
            fontFamily: "'PokemonGb', 'Press Start 2P', monospace",
            fontSize: 7,
            color: GBC_MUTED,
          }}>
            {db.length.toLocaleString()} STRAINS
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button style={tabBtn(tab === 'party')} onClick={() => setTab('party')}>PARTY</button>
        <button style={tabBtn(tab === 'pc')} onClick={() => setTab('pc')}>BILL'S PC</button>
        <button style={tabBtn(tab === 'dex')} onClick={() => setTab('dex')}>DEX</button>
      </div>

      {/* Summary bar */}
      {tab !== 'dex' && (
        <div style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 9, color: GBC_MUTED, flexShrink: 0 }}>
          {party.length}/6 IN PARTY · {strains.length} IN BILL'S PC
        </div>
      )}

      {/* PARTY TAB */}
      {tab === 'party' && (
        <PartyView
          party={party}
          db={db}
          onDelete={(id) => updateStrain(id, { inStock: false })}
          onUpdate={updateStrain}
        />
      )}

      {/* PC TAB */}
      {tab === 'pc' && (
        strains.length === 0 ? (
          <div style={{ ...pokeBox, padding: '32px 12px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 11, color: GBC_MUTED }}>NO STRAINS LOGGED</p>
            <p style={{ fontFamily: 'monospace', fontSize: 13, color: GBC_MUTED, marginTop: 10 }}>Add your first strain using the ADD tab.</p>
          </div>
        ) : (
          <>
            {(() => {
              const highThcIds = strains.filter((s) => s.thc != null && s.thc > 35).map((s) => s.id)
              if (highThcIds.length === 0) return null
              return (
                <div style={{
                  border: '2px solid #f59e0b',
                  background: GBC_BOX,
                  padding: '10px 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                }}>
                  <span style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, color: GBC_AMBER }}>
                    {highThcIds.length} STRAIN{highThcIds.length !== 1 ? 'S' : ''} &gt;35% THC
                  </span>
                  {confirmPurge ? (
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => { highThcIds.forEach((id) => deleteStrain(id)); setConfirmPurge(false) }}
                        style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '6px 10px', minHeight: 36, border: '2px solid #e84040', background: 'transparent', color: '#e84040', cursor: 'pointer' }}
                      >YES</button>
                      <button
                        onClick={() => setConfirmPurge(false)}
                        style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '6px 10px', minHeight: 36, border: `2px solid ${GBC_DARKEST}`, background: 'transparent', color: GBC_MUTED, cursor: 'pointer' }}
                      >NO</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmPurge(true)}
                      style={{ fontFamily: "'PokemonGb', 'Press Start 2P', monospace", fontSize: 8, padding: '6px 10px', minHeight: 36, border: `2px solid ${GBC_AMBER}`, background: 'transparent', color: GBC_AMBER, cursor: 'pointer', flexShrink: 0 }}
                    >
                      PURGE ALL
                    </button>
                  )}
                </div>
              )
            })()}
            <StashList strains={strains} db={db} onDelete={deleteStrain} onUpdate={updateStrain} />
          </>
        )
      )}

      {/* DEX TAB */}
      {tab === 'dex' && <StrainDex db={db} />}

    </div>
  )
}
