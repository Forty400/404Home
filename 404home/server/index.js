require('dotenv').config()

const { seed } = require('./seed')
const { createApp } = require('./app')

seed()

const app = createApp()
const PORT = Number(process.env.PORT) || 3001

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`404Home API running at http://localhost:${PORT}`)
  })
}

module.exports = { app, createApp }
