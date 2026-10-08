// 主题三态管理：light / dark / auto
// localStorage 持久化 + prefers-color-scheme 跟随
// CSS 由 main.css 的 :root / [data-theme="dark"] / @media(prefers-color-scheme:dark) 解析

export const THEMES = ['light', 'dark', 'auto']
export const STORAGE_KEY = '404home:theme'
export const DEFAULT_THEME = 'auto'

let systemListener = null
let systemCallback = null

function isValid(theme) {
  return THEMES.includes(theme)
}

export function getStoredTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return isValid(v) ? v : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function prefersDark() {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

// 把任意主题解析为实际生效值（auto → light/dark）
export function resolveTheme(theme) {
  const t = isValid(theme) ? theme : DEFAULT_THEME
  return t === 'auto' ? (prefersDark() ? 'dark' : 'light') : t
}

// 设 <html data-theme>。始终写三态值，CSS 自行解析 auto。
export function applyTheme(theme) {
  const t = isValid(theme) ? theme : DEFAULT_THEME
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = t
  }
  return t
}

export function setTheme(theme) {
  const t = isValid(theme) ? theme : DEFAULT_THEME
  try {
    localStorage.setItem(STORAGE_KEY, t)
  } catch {
    /* ignore */
  }
  applyTheme(t)
  ensureSystemWatch()
  return t
}

export function cycleTheme() {
  const cur = getStoredTheme()
  const idx = THEMES.indexOf(cur)
  const next = THEMES[(idx + 1) % THEMES.length]
  return setTheme(next)
}

// 监听系统偏好变化；仅当当前为 auto 时让 CSS 自然响应（CSS 已处理），
// 这里仅触发回调以更新 UI 图标。
export function watchSystem(callback) {
  systemCallback = callback
  ensureSystemWatch()
}

function ensureSystemWatch() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
  if (systemListener) return
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => {
    if (typeof systemCallback === 'function') systemCallback()
  }
  if (mq.addEventListener) mq.addEventListener('change', handler)
  else if (mq.addListener) mq.addListener(handler)
  systemListener = { mq, handler }
}

// 入口初始化（index.html 内联脚本已先行设 data-theme，这里做保险 + 启动系统监听）
export function initTheme() {
  const t = getStoredTheme()
  applyTheme(t)
  ensureSystemWatch()
  return t
}
