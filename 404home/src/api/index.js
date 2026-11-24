const ADMIN_TOKEN_KEY = '404home_admin_token'
const USER_TOKEN_KEY = '404home_user_token'
const CS_GUEST_TOKEN_KEY = '404home_cs_guest_token'

export function getToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY) || ''
}

export function setToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export function getUserToken() {
  return localStorage.getItem(USER_TOKEN_KEY) || ''
}

export function setUserToken(token) {
  localStorage.setItem(USER_TOKEN_KEY, token)
}

export function clearUserToken() {
  localStorage.removeItem(USER_TOKEN_KEY)
}

export function getCsGuestToken() {
  return localStorage.getItem(CS_GUEST_TOKEN_KEY) || ''
}

export function setCsGuestToken(token) {
  localStorage.setItem(CS_GUEST_TOKEN_KEY, token)
}

/** Logged-in user token, else guest CS token */
export function getCsToken() {
  return getUserToken() || getCsGuestToken()
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  const token =
    options.token !== undefined
      ? options.token
      : options.userAuth
        ? getUserToken()
        : getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `请求失败 (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  getCategories: () => request('/categories'),
  getCategory: (slug) => request(`/categories/${slug}`),
  createCategory: (body) => request('/categories', { method: 'POST', body }),
  updateCategory: (id, body) => request(`/categories/${id}`, { method: 'PUT', body }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  getTools: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString()
    return request(`/tools${qs ? `?${qs}` : ''}`)
  },
  smartSearch: (body) => request('/smart-search', { method: 'POST', body, token: '' }),
  getGroupedTools: () => request('/tools/grouped'),
  getTool: (idOrSlug) => request(`/tools/${idOrSlug}`),
  createTool: (body) => request('/tools', { method: 'POST', body }),
  updateTool: (id, body) => request(`/tools/${id}`, { method: 'PUT', body }),
  deleteTool: (id) => request(`/tools/${id}`, { method: 'DELETE' }),

  getPosts: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString()
    return request(`/posts${qs ? `?${qs}` : ''}`)
  },
  getPost: (id) => request(`/posts/${id}`),
  createPost: (body) => request('/posts', { method: 'POST', body }),
  updatePost: (id, body) => request(`/posts/${id}`, { method: 'PUT', body }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  approvePost: (id) => request(`/posts/${id}/approve`, { method: 'POST', body: {} }),
  publishPost: (id) => request(`/posts/${id}/publish`, { method: 'POST', body: {} }),
  archivePost: (id) => request(`/posts/${id}/archive`, { method: 'POST', body: {} }),
  restorePost: (id) => request(`/posts/${id}/restore`, { method: 'POST', body: {} }),
  forkPost: (id) => request(`/posts/${id}/fork`, { method: 'POST', body: {} }),

  ingestStatus: () => request('/ingest/status'),
  ingestSettings: (body) => request('/ingest/settings', { method: 'PUT', body }),
  ingestEnable: () => request('/ingest/enable', { method: 'POST', body: {} }),
  ingestDisable: () => request('/ingest/disable', { method: 'POST', body: {} }),
  ingestRun: (body = {}) => request('/ingest/run', { method: 'POST', body }),

  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),
  getStats: () => request('/stats'),
  getTraffic: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString()
    return request(`/stats/traffic${qs ? `?${qs}` : ''}`)
  },
  trackPageview: (body) => request('/analytics/pageview', { method: 'POST', body, token: '' }),

  getCaptcha: () => request('/user/captcha'),
  userRegister: (body) => request('/user/register', { method: 'POST', body }),
  userLogin: (body) => request('/user/login', { method: 'POST', body }),
  userMe: () => request('/user/me', { userAuth: true }),

  chatStatus: () => request('/chat/status', { userAuth: true }),
  chatSessions: () => request('/chat/sessions', { userAuth: true }),
  chatMessages: (sessionId) => request(`/chat/sessions/${sessionId}/messages`, { userAuth: true }),
  chatDeleteSession: (sessionId) =>
    request(`/chat/sessions/${sessionId}`, { method: 'DELETE', userAuth: true }),
  chatComplete: (body) => request('/chat/completions', { method: 'POST', body, userAuth: true }),

  /**
   * SSE stream: calls onEvent({type, ...}) for meta/delta/done/error.
   * Returns the final done payload (or throws on HTTP/error event).
   */
  chatCompleteStream: async (body, { signal, onEvent } = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream'
    }
    const token = getUserToken()
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch('/api/chat/completions/stream', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal
    })

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('text/event-stream')) {
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const err = new Error(data.error || `请求失败 (${res.status})`)
        err.status = res.status
        err.data = data
        throw err
      }
      return data
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let donePayload = null

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const chunks = buffer.split('\n\n')
      buffer = chunks.pop() || ''
      for (const block of chunks) {
        const line = block
          .split('\n')
          .map((l) => l.trim())
          .find((l) => l.startsWith('data:'))
        if (!line) continue
        const raw = line.slice(5).trim()
        if (!raw || raw === '[DONE]') continue
        let ev
        try {
          ev = JSON.parse(raw)
        } catch {
          continue
        }
        if (onEvent) onEvent(ev)
        if (ev.type === 'done') donePayload = ev
        if (ev.type === 'error') {
          const err = new Error(ev.error || '流式失败')
          err.status = 502
          err.data = { code: ev.code, error: ev.error }
          throw err
        }
      }
    }

    if (!donePayload) {
      const err = new Error('流式未完成')
      err.status = 502
      err.data = { code: 'STREAM_INCOMPLETE' }
      throw err
    }
    return donePayload
  },

  adminChatSummary: () => request('/chat/admin/summary'),
  adminChatSessions: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString()
    return request(`/chat/admin/sessions${qs ? `?${qs}` : ''}`)
  },
  adminChatSession: (id) => request(`/chat/admin/sessions/${id}`),

  listUsers: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
    ).toString()
    return request(`/wallet/users${qs ? `?${qs}` : ''}`)
  },
  adminCredit: (body) => request('/wallet/admin-credit', { method: 'POST', body }),

  csGuest: () => request('/cs/guest', { method: 'POST', body: {} }),
  csFaqs: () => request('/cs/scripts/faq', { token: '' }),
  csOpenSession: () => request('/cs/sessions', { method: 'POST', body: {}, token: getCsToken() }),
  csMessages: (id) => request(`/cs/sessions/${id}/messages`, { token: getCsToken() }),
  csSend: (id, content) =>
    request(`/cs/sessions/${id}/messages`, {
      method: 'POST',
      body: { content },
      token: getCsToken()
    }),
  csTransfer: (id) =>
    request(`/cs/sessions/${id}/transfer`, { method: 'POST', body: {}, token: getCsToken() }),

  csAdminInbox: () => request('/cs/admin/inbox'),
  csAdminSession: (id) => request(`/cs/admin/sessions/${id}`),
  csAdminReply: (id, content) =>
    request(`/cs/admin/sessions/${id}/messages`, { method: 'POST', body: { content } }),
  csAdminPresenceGet: () => request('/cs/admin/presence'),
  csAdminPresenceSet: (online) =>
    request('/cs/admin/presence', { method: 'POST', body: { online } }),
  csAdminScripts: () => request('/cs/admin/scripts'),
  csAdminCreateScript: (body) => request('/cs/admin/scripts', { method: 'POST', body }),
  csAdminUpdateScript: (id, body) => request(`/cs/admin/scripts/${id}`, { method: 'PUT', body }),
  csAdminDeleteScript: (id) => request(`/cs/admin/scripts/${id}`, { method: 'DELETE' }),
  csAdminSettings: () => request('/cs/admin/settings'),
  csAdminPutSettings: (body) => request('/cs/admin/settings', { method: 'PUT', body })
}
