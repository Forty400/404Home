const STUB_DIM = 128

function isStub() {
  return process.env.EMBEDDING_STUB === '1'
}

function isConfigured() {
  if (isStub()) return true
  return !!process.env.EMBEDDING_API_KEY
}

/**
 * Deterministic bag-of-char/bigram vector (same text → same vector).
 * ASCII vs CJK land in different bands so nonsense Latin queries don't
 * falsely match Chinese tool cards under cosine.
 */
function stubEmbed(text) {
  const s = String(text || '')
  const vec = new Array(STUB_DIM).fill(0)
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    const band = c < 128 ? 0 : c < 0x3400 ? 32 : 64
    vec[band + (c % 32)] += 1
    if (i + 1 < s.length) {
      const c2 = s.charCodeAt(i + 1)
      vec[((Math.imul(c, 131) + c2) >>> 0) % STUB_DIM] += 0.6
    }
  }
  let norm = Math.sqrt(vec.reduce((a, b) => a + b * b, 0)) || 1
  return vec.map((v) => v / norm)
}

async function embed(text) {
  if (isStub()) return stubEmbed(text)

  const apiKey = process.env.EMBEDDING_API_KEY || ''
  if (!apiKey) {
    const err = new Error('Embedding API Key 未配置')
    err.status = 503
    err.code = 'EMBEDDING_NOT_CONFIGURED'
    throw err
  }

  const base = (process.env.EMBEDDING_BASE_URL || 'https://api.siliconflow.cn/v1').replace(
    /\/$/,
    ''
  )
  const model = process.env.EMBEDDING_MODEL || 'BAAI/bge-m3'
  const res = await fetch(`${base}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, input: String(text || '') })
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error?.message || data.message || `Embedding 错误 (${res.status})`)
    err.status = 502
    err.code = 'EMBEDDING_UPSTREAM'
    throw err
  }
  const vec = data.data?.[0]?.embedding
  if (!Array.isArray(vec)) {
    const err = new Error('Embedding 响应无效')
    err.status = 502
    err.code = 'EMBEDDING_UPSTREAM'
    throw err
  }
  return vec
}

function cosine(a, b) {
  if (!a?.length || !b?.length || a.length !== b.length) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  const d = Math.sqrt(na) * Math.sqrt(nb)
  return d ? dot / d : 0
}

module.exports = { embed, isConfigured, isStub, cosine, stubEmbed }
