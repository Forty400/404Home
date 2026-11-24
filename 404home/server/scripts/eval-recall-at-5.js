#!/usr/bin/env node
/**
 * Recall@5: baseline LIKE (/api/tools logic) vs smartSearch top-5.
 * Usage: EMBEDDING_STUB=1 DEEPSEEK_STUB=1 node scripts/eval-recall-at-5.js
 */
const path = require('path')
const fs = require('fs')

require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

if (!process.env.EMBEDDING_STUB) process.env.EMBEDDING_STUB = '1'
if (!process.env.DEEPSEEK_STUB) process.env.DEEPSEEK_STUB = '1'

const { db, parseTool } = require('../db')
const { seed } = require('../seed')
const { reindexAllTools } = require('../services/toolIndex')
const { smartSearch } = require('../services/smartSearch')

if (!db.prepare('SELECT COUNT(*) AS n FROM tools').get().n) {
  console.log('empty tools table → seeding…')
  seed()
}

function baselineTop5(q) {
  const like = `%${q}%`
  const rows = db
    .prepare(
      `SELECT * FROM tools
       WHERE enabled = 1 AND (name LIKE ? OR summary LIKE ? OR tags LIKE ?)
       ORDER BY sort ASC, id DESC
       LIMIT 5`
    )
    .all(like, like, like)
  return rows.map(parseTool).map((t) => t.id)
}

function recallAt5(predicted, relevant) {
  if (!relevant.length) return 0
  const set = new Set(predicted.slice(0, 5))
  let hit = 0
  for (const id of relevant) if (set.has(id)) hit++
  return hit / relevant.length
}

async function main() {
  const goldenPath = path.join(__dirname, '..', 'data', 'eval', 'smart-search-golden.json')
  const golden = JSON.parse(fs.readFileSync(goldenPath, 'utf8'))
  if (!Array.isArray(golden) || golden.length < 1) {
    console.error('golden set empty')
    process.exit(1)
  }

  console.log('reindexing…')
  await reindexAllTools()

  let baseSum = 0
  let newSum = 0
  const rows = []

  for (const g of golden) {
    const baseIds = baselineTop5(g.query)
    const smart = await smartSearch({ q: g.query, rerank: true })
    const newIds = (smart.items || []).map((i) => i.tool.id)
    const br = recallAt5(baseIds, g.relevant_tool_ids)
    const nr = recallAt5(newIds, g.relevant_tool_ids)
    baseSum += br
    newSum += nr
    rows.push({
      query: g.query,
      baseline: (br * 100).toFixed(0) + '%',
      smart: (nr * 100).toFixed(0) + '%',
      baseIds: baseIds.join(','),
      newIds: newIds.join(',')
    })
  }

  const n = golden.length
  const baseAvg = baseSum / n
  const newAvg = newSum / n

  console.log('\nQuery                          Baseline@5  Smart@5')
  console.log('-'.repeat(56))
  for (const r of rows) {
    const q = r.query.padEnd(28).slice(0, 28)
    console.log(`${q}  ${r.baseline.padStart(9)}  ${r.smart.padStart(7)}`)
  }
  console.log('-'.repeat(56))
  console.log(
    `AVG Recall@5 (${n} queries)     ${(baseAvg * 100).toFixed(1)}%     ${(newAvg * 100).toFixed(1)}%`
  )
  console.log(`\nResume line: Recall@5 ${(baseAvg * 100).toFixed(0)}% → ${(newAvg * 100).toFixed(0)}%`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
