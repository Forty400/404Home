import { ref, readonly } from 'vue'

export const THEME_KEY = '404home-theme-pref'
/** User preference: explicit light/dark or follow OS */
export const THEME_PREFS = Object.freeze(['system', 'light', 'dark'])

const preference = ref('system')
const resolved = ref('light')

let mediaQuery = null
let mediaHandler = null

function normalizePref(value) {
  return THEME_PREFS.includes(value) ? value : 'system'
}

function getSystemTheme() {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(pref) {
  const p = normalizePref(pref)
  return p === 'system' ? getSystemTheme() : p
}

function writeDomTheme(mode) {
  document.documentElement.dataset.theme = mode
}

function detachSystemListener() {
  if (mediaQuery && mediaHandler) {
    if (mediaQuery.removeEventListener) {
      mediaQuery.removeEventListener('change', mediaHandler)
    } else if (mediaQuery.removeListener) {
      mediaQuery.removeListener(mediaHandler)
    }
  }
  mediaQuery = null
  mediaHandler = null
}

function attachSystemListener() {
  detachSystemListener()
  if (typeof window === 'undefined' || !window.matchMedia) return
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaHandler = () => {
    if (preference.value !== 'system') return
    resolved.value = getSystemTheme()
    writeDomTheme(resolved.value)
  }
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', mediaHandler)
  } else if (mediaQuery.addListener) {
    mediaQuery.addListener(mediaHandler)
  }
}

export function getStoredPreference() {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    if (raw == null) return 'system'
    return normalizePref(raw)
  } catch {
    return 'system'
  }
}

export function applyPreference(pref) {
  const next = normalizePref(pref)
  preference.value = next
  resolved.value = resolveTheme(next)
  writeDomTheme(resolved.value)

  try {
    localStorage.setItem(THEME_KEY, next)
  } catch {
    /* ignore quota / private mode */
  }

  if (next === 'system') {
    attachSystemListener()
  } else {
    detachSystemListener()
  }

  return next
}

export function initTheme() {
  return applyPreference(getStoredPreference())
}

export function setTheme(pref) {
  return applyPreference(pref)
}

/** Cycle: system → light → dark → system */
export function cycleTheme() {
  const order = THEME_PREFS
  const i = order.indexOf(preference.value)
  const next = order[(i + 1) % order.length]
  return applyPreference(next)
}

/** @deprecated use cycleTheme; kept for call-site compatibility */
export function toggleTheme() {
  return cycleTheme()
}

export function useTheme() {
  return {
    preference: readonly(preference),
    resolved: readonly(resolved),
    /** @deprecated alias of preference for older UI */
    theme: readonly(preference),
    setTheme,
    cycleTheme,
    toggleTheme,
    initTheme
  }
}
