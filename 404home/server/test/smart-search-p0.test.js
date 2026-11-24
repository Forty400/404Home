/**
 * Smart search P0 — docs/spdd/4-测试条例/404home-tool-rag-mcp-cases.md
 * TC-01 … TC-08
 */
const { describe, it, before, after, beforeEach } = require('node:test')
const assert = require('node:assert/strict')
const { setupTestEnv, cleanupDb, startServer, enableDeepseekStub } = require('./helpers')

const dbFile = setupTestEnv()
process.env.EMBEDDING_STUB = '1'
process.env.VECTOR_BACKEND = 'sqlite'
enableDeepseekStub()
delete process.env.SMART_SEARCH_RERANK_FAIL

const { db } = require('../db')
const { seed } = require('../seed')
const { createApp } = require('../app')
const { chunkTool } = require('../services/toolChunker')
const { embed } = require('../services/embeddings')
const { retrieveRrf } = require('../services/toolRetrieve')
const { reindexAllTools } = require('../services/toolIndex')

seed()
const app = createApp()

let api

before(async () => {
  api = await startServer(app)
})

after(async () => {
  if (api) await api.close()
  cleanupDb(dbFile)
})

beforeEach(() => {
  process.env.EMBEDDING_STUB = '1'
  enableDeepseekStub()
  delete process.env.SMART_SEARCH_RERANK_FAIL
  delete process.env.EMBEDDING_API_KEY
})

function sampleTool() {
  return {
    id: 9001,
    name: 'PosterAI',
    summary: '适合做海报的免费 AI 设计工具',
    tags: ['海报', '设计', '免费'],
    scenario: '电商主图与活动海报快速出图'
  }
}

describe('smart-search P0', () => {
  it('TC-01: entity chunker yields ≥2 chunks with field/text', () => {
    const chunks = chunkTool(sampleTool())
    assert.ok(chunks.length >= 2)
    for (const c of chunks) {
      assert.equal(c.tool_id, 9001)
      assert.ok(c.field)
      assert.ok(String(c.text).trim().length > 0)
    }
  })

  it('TC-02: stub embedding is stable for same text', async () => {
    const a = await embed('hello-404home')
    const b = await embed('hello-404home')
    assert.equal(a.length, b.length)
    assert.ok(a.length > 0)
    assert.deepEqual(a, b)
  })

  it('TC-03: dual-path RRF merges and dedupes by tool_id', async () => {
    await reindexAllTools()
    const hits = await retrieveRrf('免费 AI 海报')
    assert.ok(Array.isArray(hits))
    assert.ok(hits.length <= 40)
    const ids = hits.map((h) => h.tool_id)
    assert.equal(ids.length, new Set(ids).size)
    for (let i = 1; i < hits.length; i++) {
      assert.ok(hits[i - 1].score >= hits[i].score)
    }
  })

  it('TC-04: smartSearch returns ≤5 items with reason + tool', async () => {
    await reindexAllTools()
    const res = await api.request('POST', '/api/smart-search', {
      body: { q: '适合做海报的免费 AI', rerank: true }
    })
    assert.equal(res.status, 200)
    assert.ok(res.data.items.length <= 5)
    assert.ok(res.data.items.length >= 1)
    for (const item of res.data.items) {
      assert.ok(item.reason && String(item.reason).trim())
      assert.ok(item.tool)
      assert.ok(item.tool.id)
      assert.ok(item.tool.name)
      assert.ok(item.tool.slug !== undefined)
    }
  })

  it('TC-05: rerank failure degrades to RRF', async () => {
    await reindexAllTools()
    process.env.SMART_SEARCH_RERANK_FAIL = '1'
    const res = await api.request('POST', '/api/smart-search', {
      body: { q: 'AI 对话助手', rerank: true }
    })
    assert.equal(res.status, 200)
    assert.ok(res.data.items.length <= 5)
    assert.equal(res.data.meta.degraded, true)
    for (const item of res.data.items) {
      assert.match(String(item.reason), /降级|RRF/i)
    }
  })

  it('TC-06: empty query → 400 INVALID_QUERY', async () => {
    const res = await api.request('POST', '/api/smart-search', {
      body: { q: '   ' }
    })
    assert.equal(res.status, 400)
    assert.equal(res.data.code, 'INVALID_QUERY')
  })

  it('TC-07: embedding not configured → 503', async () => {
    process.env.EMBEDDING_STUB = '0'
    delete process.env.EMBEDDING_API_KEY
    const res = await api.request('POST', '/api/smart-search', {
      body: { q: '海报' }
    })
    assert.equal(res.status, 503)
    assert.equal(res.data.code, 'EMBEDDING_NOT_CONFIGURED')
  })

  it('TC-08: no hits → 200 empty items', async () => {
    await reindexAllTools()
    const res = await api.request('POST', '/api/smart-search', {
      body: { q: 'zz-uuid-never-match-9f3c2a1b' }
    })
    assert.equal(res.status, 200)
    assert.deepEqual(res.data.items, [])
  })

  it('existing LIKE /api/tools?q= still works', async () => {
    const res = await api.request('GET', '/api/tools?q=ChatGPT')
    assert.equal(res.status, 200)
    assert.ok(Array.isArray(res.data.items))
    assert.ok(res.data.items.some((t) => /chatgpt/i.test(t.name) || /chatgpt/i.test(t.slug)))
  })
})
