const { db, parseTool } = require('../db')
const { chunkTool } = require('./toolChunker')
const { embed, isConfigured } = require('./embeddings')

async function reindexAllTools() {
  if (!isConfigured()) {
    const err = new Error('Embedding API Key 未配置')
    err.status = 503
    err.code = 'EMBEDDING_NOT_CONFIGURED'
    throw err
  }

  const tools = db
    .prepare('SELECT * FROM tools WHERE enabled = 1')
    .all()
    .map(parseTool)

  const del = db.prepare('DELETE FROM tool_chunks')
  const ins = db.prepare(
    `INSERT INTO tool_chunks (tool_id, field, text, embedding_json, updated_at)
     VALUES (?, ?, ?, ?, datetime('now'))`
  )

  const tx = db.transaction(() => {
    del.run()
  })
  tx()

  let count = 0
  for (const tool of tools) {
    const chunks = chunkTool(tool)
    for (const c of chunks) {
      const vec = await embed(c.text)
      ins.run(c.tool_id, c.field, c.text, JSON.stringify(vec))
      count++
    }
  }
  return { tools: tools.length, chunks: count }
}

module.exports = { reindexAllTools }
