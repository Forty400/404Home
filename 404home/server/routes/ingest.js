const { spawn } = require('child_process')
const path = require('path')
const Router = require('koa-router')
const { authRequired } = require('../middleware/auth')
const {
  getSnapshot,
  setControl,
  setConfigLimits,
  getStatus,
  setStatus,
  getControl
} = require('../ingest/control')

const router = new Router({ prefix: '/api/ingest' })

let child = null

router.get('/status', authRequired, async (ctx) => {
  ctx.body = getSnapshot()
})

router.put('/settings', authRequired, async (ctx) => {
  const body = ctx.request.body || {}
  const controlPatch = {}
  if (body.enabled !== undefined) controlPatch.enabled = !!body.enabled
  if (body.intervalHours !== undefined) controlPatch.intervalHours = body.intervalHours
  if (Object.keys(controlPatch).length) setControl(controlPatch)

  const limits = {}
  for (const key of ['dailyLimit', 'newsLimit', 'githubLimit', 'pendingLimit']) {
    if (body[key] !== undefined) limits[key] = body[key]
  }
  if (Object.keys(limits).length) setConfigLimits(limits)

  // Reschedule cron via pm2 when interval changes (best-effort on prod)
  if (body.intervalHours !== undefined) {
    tryRescheduleCron(Number(body.intervalHours))
  }

  ctx.body = getSnapshot()
})

router.post('/enable', authRequired, async (ctx) => {
  setControl({ enabled: true })
  ctx.body = getSnapshot()
})

router.post('/disable', authRequired, async (ctx) => {
  setControl({ enabled: false })
  ctx.body = getSnapshot()
})

router.post('/run', authRequired, async (ctx) => {
  const force = !!(ctx.request.body && ctx.request.body.force)
  const control = getControl()
  if (!control.enabled && !force) {
    ctx.status = 409
    ctx.body = { error: '采集已关闭', code: 'ingest_disabled', snapshot: getSnapshot() }
    return
  }
  const status = getStatus()
  if (status.running || child) {
    ctx.status = 409
    ctx.body = { error: '采集正在进行', code: 'ingest_busy', ...getSnapshot() }
    return
  }

  setControl({ lastTriggeredAt: new Date().toISOString() })
  setStatus({
    running: true,
    phase: 'starting',
    current: 0,
    total: 0,
    message: 'starting',
    lastError: '',
    lastStartedAt: new Date().toISOString()
  })

  const script = path.join(__dirname, '..', 'ingest', 'run.js')
  child = spawn(process.execPath, [script], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, INGEST_FORCE: force ? '1' : '' },
    stdio: ['ignore', 'pipe', 'pipe']
  })

  let stderr = ''
  child.stderr.on('data', (buf) => {
    stderr += buf.toString()
  })
  child.on('exit', (code) => {
    child = null
    const st = getStatus()
    if (st.running) {
      setStatus({
        running: false,
        phase: code === 0 ? 'done' : 'error',
        message: code === 0 ? 'finished' : 'process exited ' + code,
        lastError: code === 0 ? '' : (stderr || '').slice(-500),
        lastFinishedAt: new Date().toISOString()
      })
    }
  })

  ctx.body = { ok: true, ...getSnapshot() }
})

function tryRescheduleCron(intervalHours) {
  // Map hours → cron (UTC). 24 → 0 1 * * *; 12 → 0 */12 * * *; etc.
  const h = Number(intervalHours)
  if (!Number.isFinite(h) || h < 1) return
  let cron = '0 1 * * *'
  if (h >= 24) cron = '0 1 * * *'
  else if (h >= 12) cron = '0 */12 * * *'
  else if (h >= 6) cron = '0 */6 * * *'
  else if (h >= 3) cron = '0 */3 * * *'
  else cron = '0 * * * *'
  try {
    const { execSync } = require('child_process')
    execSync('pm2 delete 404home-ingest', { stdio: 'ignore' })
    execSync(
      `pm2 start ingest/run.js --name 404home-ingest --cron "${cron}" --no-autorestart`,
      { cwd: path.join(__dirname, '..'), stdio: 'ignore' }
    )
    execSync('pm2 save', { stdio: 'ignore' })
  } catch {
    /* local/dev without pm2 */
  }
}

module.exports = router
