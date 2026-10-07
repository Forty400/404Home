const ADMIN_TOKEN_KEY = '404home_admin_token'
const USER_TOKEN_KEY = '404home_user_token'

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

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  const token = options.userAuth ? getUserToken() : getToken()
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

  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me'),
  getStats: () => request('/stats'),

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
  adminCredit: (body) => request('/wallet/admin-credit', { method: 'POST', body })
}
