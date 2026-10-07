const crypto = require('crypto')

const store = new Map()
const TTL_MS = 5 * 60 * 1000

function prune() {
  const now = Date.now()
  for (const [id, row] of store) {
    if (row.expiresAt < now) store.delete(id)
  }
}

function randomCode(len = 4) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  const bytes = crypto.randomBytes(len)
  for (let i = 0; i < len; i++) out += chars[bytes[i] % chars.length]
  return out
}

function createCaptcha() {
  prune()
  const id = crypto.randomBytes(16).toString('hex')
  const code = randomCode(4)
  store.set(id, { code: code.toUpperCase(), expiresAt: Date.now() + TTL_MS })
  const svg = renderSvg(code)
  const out = { id, svg }
  if (process.env.CAPTCHA_DEBUG === '1') out.code = code
  return out
}

function consumeCaptcha(id, input) {
  prune()
  if (!id || input == null) return false
  const row = store.get(id)
  store.delete(id)
  if (!row || row.expiresAt < Date.now()) return false
  return String(input).trim().toUpperCase() === row.code
}

function renderSvg(code) {
  const w = 120
  const h = 40
  const noise = Array.from({ length: 5 }, (_, i) => {
    const x1 = (i * 23) % w
    const y1 = (i * 11) % h
    const x2 = (x1 + 40) % w
    const y2 = (y1 + 18) % h
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#c5bba8" stroke-width="1"/>`
  }).join('')
  const letters = code.split('').map((ch, i) => {
    const x = 18 + i * 24
    const rot = ((i % 2) * 2 - 1) * 8
    return `<text x="${x}" y="28" transform="rotate(${rot} ${x} 28)" font-family="monospace" font-size="22" font-weight="700" fill="#1f5b45">${ch}</text>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="100%" height="100%" fill="#fffdf8"/>
  ${noise}
  ${letters}
</svg>`
}

module.exports = { createCaptcha, consumeCaptcha }
