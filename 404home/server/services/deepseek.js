const DEFAULT_BASE = 'https://api.deepseek.com'
const DEFAULT_MODEL = 'deepseek-flash'

function getConfig() {
  return {
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseUrl: (process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE).replace(/\/$/, ''),
    model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
    // USD per 1M tokens (approx cache-miss / output; override via env)
    inputUsdPerMTok: Number(process.env.DEEPSEEK_INPUT_USD_PER_MTOK || 0.15),
    outputUsdPerMTok: Number(process.env.DEEPSEEK_OUTPUT_USD_PER_MTOK || 0.6),
    usdCny: Number(process.env.USD_CNY_RATE || 7.2),
    markup: Number(process.env.BILLING_MARKUP || 1.2),
    maxHistory: Number(process.env.CHAT_MAX_HISTORY || 20)
  }
}

function isConfigured() {
  return !!getConfig().apiKey
}

/** Convert usage to integer RMB cents (ceil, min 1 if any tokens). */
function usageToCents(usage) {
  const cfg = getConfig()
  const prompt = Number(usage?.prompt_tokens || 0)
  const completion = Number(usage?.completion_tokens || 0)
  if (prompt <= 0 && completion <= 0) return 0
  const usd =
    (prompt / 1e6) * cfg.inputUsdPerMTok + (completion / 1e6) * cfg.outputUsdPerMTok
  const cny = usd * cfg.usdCny * cfg.markup
  const cents = Math.ceil(cny * 100)
  return Math.max(1, cents)
}

async function chatCompletions(messages) {
  const cfg = getConfig()
  if (!cfg.apiKey) {
    const err = new Error('DeepSeek API Key 未配置')
    err.status = 503
    err.code = 'DEEPSEEK_NOT_CONFIGURED'
    throw err
  }

  const url = `${cfg.baseUrl}/chat/completions`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`
    },
    body: JSON.stringify({
      model: cfg.model,
      messages,
      stream: false
    })
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data.error?.message || data.message || `DeepSeek 错误 (${res.status})`
    const err = new Error(msg)
    err.status = 502
    err.code = 'DEEPSEEK_UPSTREAM'
    err.upstream = data
    throw err
  }

  const choice = data.choices?.[0]?.message
  const content = choice?.content || ''
  const usage = data.usage || {}
  return {
    content,
    model: data.model || cfg.model,
    usage: {
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0
    },
    cost_cents: usageToCents(usage)
  }
}

module.exports = { getConfig, isConfigured, usageToCents, chatCompletions }
