const fs = require('fs')
const path = require('path')

const root = __dirname
const controlPath = path.join(root, 'control.json')
const statusPath = path.join(root, 'status.json')
const configPath = () =>
  process.env.INGEST_CONFIG
    ? path.resolve(process.env.INGEST_CONFIG)
    : fs.existsSync(path.join(root, 'config.json'))
      ? path.join(root, 'config.json')
      : path.join(root, 'config.example.json')

const DEFAULT_CONTROL = {
  enabled: true,
  intervalHours: 24,
  lastTriggeredAt: null
}

const DEFAULT_STATUS = {
  running: false,
  phase: 'idle',
  current: 0,
  total: 0,
  message: '',
  lastError: '',
  lastStartedAt: null,
  lastFinishedAt: null,
  lastPosted: 0,
  lastNews: 0,
  lastGithub: 0
}

function readJson(file, fallback) {
  try {
    if (!fs.existsSync(file)) return { ...fallback }
    return { ...fallback, ...JSON.parse(fs.readFileSync(file, 'utf8')) }
  } catch {
    return { ...fallback }
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function getControl() {
  return readJson(controlPath, DEFAULT_CONTROL)
}

function setControl(patch) {
  const next = { ...getControl(), ...patch }
  if (patch.enabled !== undefined) next.enabled = !!patch.enabled
  if (patch.intervalHours !== undefined) {
    const n = Number(patch.intervalHours)
    next.intervalHours = Number.isFinite(n) && n >= 1 ? Math.min(n, 168) : next.intervalHours
  }
  writeJson(controlPath, next)
  return next
}

function getStatus() {
  return readJson(statusPath, DEFAULT_STATUS)
}

function setStatus(patch) {
  const next = { ...getStatus(), ...patch }
  writeJson(statusPath, next)
  return next
}

function getConfig() {
  return readJson(configPath(), {
    dailyLimit: 5,
    newsLimit: 3,
    githubLimit: 2,
    pendingLimit: 20,
    newsFeeds: [],
    githubQueries: []
  })
}

function setConfigLimits(patch) {
  const cfg = getConfig()
  const next = { ...cfg }
  for (const key of ['dailyLimit', 'newsLimit', 'githubLimit', 'pendingLimit']) {
    if (patch[key] !== undefined) {
      const n = Number(patch[key])
      if (Number.isFinite(n) && n >= 0) next[key] = Math.floor(n)
    }
  }
  writeJson(configPath(), next)
  return next
}

function getSnapshot() {
  const control = getControl()
  const status = getStatus()
  const config = getConfig()
  return {
    enabled: !!control.enabled,
    intervalHours: control.intervalHours,
    lastTriggeredAt: control.lastTriggeredAt,
    dailyLimit: config.dailyLimit,
    newsLimit: config.newsLimit,
    githubLimit: config.githubLimit,
    pendingLimit: config.pendingLimit,
    status
  }
}

module.exports = {
  getControl,
  setControl,
  getStatus,
  setStatus,
  getConfig,
  setConfigLimits,
  getSnapshot,
  controlPath,
  statusPath
}
