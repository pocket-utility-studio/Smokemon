# Smokemon — Project Rules for Claude

## FULLSCREEN LAYOUT PROTECTION

**Before making ANY change to `src/layouts/AppLayout.tsx` that could affect the fullscreen layout:**
1. Explain exactly which lines/values will change and why
2. Wait for explicit approval before proceeding

The fullscreen layout is considered correct and locked. Do not adjust it incidentally while fixing other things.

### Fullscreen layout spec (locked values)

These are the values that define the fullscreen appearance. Do not change without approval:

| Property | Value |
|---|---|
| Shell width | `min(100vw, calc(100dvh * 78 / 133))` |
| Shell height (fullscreen) | `calc(100dvh - max(env(safe-area-inset-top, 0px), 20px))` |
| Shell background | `transparent` (kiwi gradient is on the outer wrapper) |
| Lens margin (fullscreen) | `0 2%` |
| Lens border-radius | `12px 12px 6px 6px` |
| Lens overflow | `hidden` |
| Controls height (fullscreen) | `6px` (thin green strip at bottom) |
| Controls height (emulator) | `42%` |
| Screen area padding | `26px 12px 0` (26px top clears the LED) |
| Logo area height | `40px` (always visible inside lens bottom) |
| Transition easing | `0.6s cubic-bezier(0.25, 1, 0.5, 1)` |
| Safe area padding | `max(env(safe-area-inset-top, 0px), 20px)` on outer wrapper |

### What "fullscreen" means
- Shell fills full viewport height
- Lens takes up nearly all of the shell (2% side margins)
- Controls area collapses to a 6px green sliver at the bottom
- Hardware buttons (D-pad, A/B, Start/Select, Speaker) are invisible (opacity 0, pointer-events none)
- App content is fully visible (opacity 1)
- Splash is hidden (opacity 0, pointer-events none)
- COMM notch fades to 0.4 opacity

### Key architectural constraints
- Both `<SplashScreen>` and `<Outlet>` are **always in the DOM** — never conditionally rendered
- Cross-fade is done via `opacity` transitions only — unmounting breaks the animation
- The flex chain `lens → screen-area → inner-frame → active-display` must stay intact for the screen to fill the lens without overflowing

---

## General project rules

- No emojis anywhere
- All caps for game UI labels
- No border-radius anywhere in screen content (`.gbc-screen-content * { border-radius: 0 !important }`)
- Mobile only — touch-friendly tap targets (44px+), no hover effects
- Temperature in Celsius only
- `npm install` requires `--legacy-peer-deps`
- Key colors: `#84cc16` accent, `#c8e890` text, `#4a7a10` muted, `#0e1a0b` charcoal
