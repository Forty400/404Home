const TOKEN_KEY = '404home_admin_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  const token = getToken()
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
  getStats: () => request('/stats')
}
