#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

async function main() {
  const { db } = require('../db')
  if (!db.prepare('SELECT COUNT(*) AS n FROM tools').get().n) {
    require('../seed').seed()
  }
  const { reindexAllTools } = require('../services/toolIndex')
  const result = await reindexAllTools()
  console.log(`reindex ok: tools=${result.tools} chunks=${result.chunks}`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
