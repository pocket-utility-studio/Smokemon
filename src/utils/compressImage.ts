/**
 * Compress/resize an image data URL using a canvas.
 * Returns a new data URL at the given max dimension and JPEG quality.
 */
export function compressImage(
  dataUrl: string,
  maxDimension = 400,
  quality = 0.75,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img
      const scale = Math.min(1, maxDimension / Math.max(w, h))
      const cw = Math.round(w * scale)
      const ch = Math.round(h * scale)

      const canvas = document.createElement('canvas')
      canvas.width  = cw
      canvas.height = ch

      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(dataUrl); return }

      ctx.drawImage(img, 0, 0, cw, ch)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => reject(new Error('compress: image load failed'))
    img.src = dataUrl
  })
}
