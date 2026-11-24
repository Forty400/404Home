const { db } = require('../db')
const { embed, cosine } = require('./embeddings')

function retrieveK() {
  return Math.max(1, Number(process.env.RETRIEVE_K || 20))
}

function rrfK() {
  return Math.max(1, Number(process.env.RRF_K || 60))
}

const FIELD_WEIGHT = { name: 4, summary: 2, tags: 2, scenario: 1.5, card: 1 }

/** Whitespace tokens + CJK 2/3-grams so NL queries can LIKE-hit. */
function queryTokens(q) {
  const s = String(q || '').trim()
  if (!s) return []
  const out = new Set()
  for (const p of s.split(/[\s\u3000,，、。！？；：]+/)) {
    if (p.length >= 2) out.add(p)
  }
  const cjk = s.replace(/[^\u4e00-\u9fff]+/g, ' ')
  for (const run of cjk.split(/\s+/)) {
    for (const n of [2, 3]) {
      for (let i = 0; i + n <= run.length; i++) out.add(run.slice(i, i + n))
    }
  }
  if (/[A-Za-z0-9]{2,}/.test(s)) {
    for (const m of s.match(/[A-Za-z0-9]{2,}/g) || []) out.add(m)
  }
  return [...out]
}

function keywordRetrieve(q, k = retrieveK()) {
  const needle = String(q || '').trim()
  if (!needle) return []
  const tokens = queryTokens(needle)
  if (!tokens.length) return []

  const best = new Map()
  for (const token of tokens) {
    const rows = db
      .prepare(
        `SELECT c.id AS chunk_id, c.tool_id, c.field, c.text
         FROM tool_chunks c
         JOIN tools t ON t.id = c.tool_id AND t.enabled = 1
         WHERE c.text LIKE ?`
      )
      .all(`%${token}%`)
    for (const row of rows) {
      const w = FIELD_WEIGHT[row.field] || 1
      const bonus = row.field === 'name' && row.text.includes(token) ? 2 : 0
      const score = w + bonus + token.length * 0.1
      const prev = best.get(row.tool_id)
      if (!prev || score > prev.score) {
        best.set(row.tool_id, {
          tool_id: row.tool_id,
          chunk_id: row.chunk_id,
          score,
          source: 'keyword'
        })
      } else {
        prev.score += 0.5
      }
    }
  }
  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, k)
}

async function vectorRetrieve(q, k = retrieveK()) {
  const needle = String(q || '').trim()
  if (!needle) return []
  const qVec = await embed(needle)
  const rows = db
    .prepare(
      `SELECT c.id AS chunk_id, c.tool_id, c.field, c.embedding_json
       FROM tool_chunks c
       JOIN tools t ON t.id = c.tool_id AND t.enabled = 1`
    )
    .all()

  const best = new Map()
  for (const row of rows) {
    let vec
    try {
      vec = JSON.parse(row.embedding_json || '[]')
    } catch {
      continue
    }
    const score = cosine(qVec, vec)
    // drop weak noise (stub / cross-script overlap)
    if (score < 0.55) continue
    const prev = best.get(row.tool_id)
    if (!prev || score > prev.score) {
      best.set(row.tool_id, {
        tool_id: row.tool_id,
        chunk_id: row.chunk_id,
        score,
        source: 'vector'
      })
    }
  }
  return [...best.values()].sort((a, b) => b.score - a.score).slice(0, k)
}

function rrfFuse(lists, k = rrfK(), limit = 40) {
  const scores = new Map()
  for (const list of lists) {
    list.forEach((hit, idx) => {
      const rank = idx + 1
      const add = 1 / (k + rank)
      const prev = scores.get(hit.tool_id) || {
        tool_id: hit.tool_id,
        score: 0,
        source: 'rrf',
        chunk_id: hit.chunk_id
      }
      prev.score += add
      if (!prev.chunk_id) prev.chunk_id = hit.chunk_id
      scores.set(hit.tool_id, prev)
    })
  }
  return [...scores.values()].sort((a, b) => b.score - a.score).slice(0, limit)
}

async function retrieveRrf(q) {
  const kw = keywordRetrieve(q)
  const vec = await vectorRetrieve(q)
  return rrfFuse([kw, vec])
}

module.exports = {
  keywordRetrieve,
  vectorRetrieve,
  rrfFuse,
  retrieveRrf,
  retrieveK
}
