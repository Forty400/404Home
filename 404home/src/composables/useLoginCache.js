const CACHE_KEY = '404home_login_cache'

export function useLoginCache() {
  function load() {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (!raw) return null
      const data = JSON.parse(raw)
      if (!data || typeof data.email !== 'string' || !data.email) return null
      // Migrate: drop legacy password field if present
      if (Object.prototype.hasOwnProperty.call(data, 'password')) {
        save(data.email)
      }
      return { email: data.email }
    } catch {
      return null
    }
  }

  function save(email) {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        email: String(email || '')
      })
    )
  }

  function clear() {
    localStorage.removeItem(CACHE_KEY)
  }

  return { load, save, clear, CACHE_KEY }
}
