export function haptic(ms = 30) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(ms)
  } catch {}
}
