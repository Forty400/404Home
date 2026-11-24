const { billingFromEnv } = require('./providers')

function usageToCents(usage, rates) {
  const cfg = rates || billingFromEnv()
  const prompt = Number(usage?.prompt_tokens || 0)
  const completion = Number(usage?.completion_tokens || 0)
  if (prompt <= 0 && completion <= 0) return 0
  const usd =
    (prompt / 1e6) * cfg.inputUsdPerMTok + (completion / 1e6) * cfg.outputUsdPerMTok
  const cny = usd * cfg.usdCny * cfg.markup
  const cents = Math.ceil(cny * 100)
  return Math.max(1, cents)
}

function stubResult(provider) {
  const usage = {
    prompt_tokens: 100,
    completion_tokens: 50,
    total_tokens: 150
  }
  return {
    content: '[stub] 404Home DeepSeek trial reply',
    model: `stub-${provider.id}`,
    usage,
    cost_cents: usageToCents(usage, provider)
  }
}

async function chatCompletions(provider, messages) {
  if (process.env.DEEPSEEK_STUB === '1') {
    return stubResult(provider)
  }

  if (!provider.apiKey) {
    const err = new Error('DeepSeek API Key 未配置')
    err.status = 503
    err.code = 'DEEPSEEK_NOT_CONFIGURED'
    throw err
  }

  const url = `${provider.baseUrl}/chat/completions`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      stream: false
    })
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.error?.message || data.message || `LLM 错误 (${res.status})`
    const err = new Error(msg)
    err.status = 502
    err.code = 'DEEPSEEK_UPSTREAM'
    err.upstream = data
    throw err
  }

  const choice = data.choices?.[0]?.message
  const content = choice?.content || ''
  const usage = data.usage || {}
  const normalized = {
    prompt_tokens: usage.prompt_tokens || 0,
    completion_tokens: usage.completion_tokens || 0,
    total_tokens: usage.total_tokens || 0
  }
  return {
    content,
    model: data.model || provider.model,
    usage: normalized,
    cost_cents: usageToCents(normalized, provider)
  }
}

/**
 * Async generator: yields { type:'delta', content } then
 * { type:'result', content, usage, model, cost_cents }.
 */
async function* chatStream(provider, messages, { signal } = {}) {
  if (process.env.DEEPSEEK_STUB === '1') {
    const full = stubResult(provider)
    const parts = ['[stub] ', '404Home ', 'DeepSeek ', 'trial ', 'reply']
    for (const part of parts) {
      if (signal?.aborted) break
      yield { type: 'delta', content: part }
    }
    const content = signal?.aborted
      ? parts.join('').slice(0, Math.max(1, Math.floor(parts.join('').length / 2)))
      : full.content
    // Stub: fixed usage even on abort so billing tests stay deterministic
    yield {
      type: 'result',
      content,
      model: full.model,
      usage: full.usage,
      cost_cents: full.cost_cents
    }
    return
  }

  if (!provider.apiKey) {
    const err = new Error('DeepSeek API Key 未配置')
    err.status = 503
    err.code = 'DEEPSEEK_NOT_CONFIGURED'
    throw err
  }

  const url = `${provider.baseUrl}/chat/completions`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${provider.apiKey}`
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      stream: true
    }),
    signal
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const msg = data.error?.message || data.message || `LLM 错误 (${res.status})`
    const err = new Error(msg)
    err.status = 502
    err.code = 'DEEPSEEK_UPSTREAM'
    err.upstream = data
    throw err
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let content = ''
  let usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  let model = provider.model

  try {
    while (true) {
      if (signal?.aborted) break
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const raw = trimmed.slice(5).trim()
        if (!raw || raw === '[DONE]') continue
        let payload
        try {
          payload = JSON.parse(raw)
        } catch {
          continue
        }
        if (payload.model) model = payload.model
        if (payload.usage) {
          usage = {
            prompt_tokens: payload.usage.prompt_tokens || 0,
            completion_tokens: payload.usage.completion_tokens || 0,
            total_tokens: payload.usage.total_tokens || 0
          }
        }
        const delta = payload.choices?.[0]?.delta?.content
        if (delta) {
          content += delta
          yield { type: 'delta', content: delta }
        }
      }
    }
  } finally {
    try {
      await reader.cancel()
    } catch {
      /* ignore */
    }
  }

  // No usage from upstream: approximate from content length (documented shortcut)
  if (!usage.prompt_tokens && !usage.completion_tokens && content) {
    // shortcut: no upstream usage on abort/partial, charge 0 until upgrade to tokenizer
    usage = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  }

  yield {
    type: 'result',
    content,
    model,
    usage,
    cost_cents: usageToCents(usage, provider)
  }
}

module.exports = { chatCompletions, chatStream, usageToCents, stubResult }
