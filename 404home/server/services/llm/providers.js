const DEFAULT_DEEPSEEK_BASE = 'https://api.deepseek.com'
const DEFAULT_DEEPSEEK_MODEL = 'deepseek-flash'

function billingFromEnv() {
  return {
    inputUsdPerMTok: Number(process.env.DEEPSEEK_INPUT_USD_PER_MTOK || 0.15),
    outputUsdPerMTok: Number(process.env.DEEPSEEK_OUTPUT_USD_PER_MTOK || 0.6),
    usdCny: Number(process.env.USD_CNY_RATE || 7.2),
    markup: Number(process.env.BILLING_MARKUP || 1.2)
  }
}

function buildDeepseek() {
  return {
    id: 'deepseek',
    baseUrl: (process.env.DEEPSEEK_BASE_URL || DEFAULT_DEEPSEEK_BASE).replace(/\/$/, ''),
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    model: process.env.DEEPSEEK_MODEL || DEFAULT_DEEPSEEK_MODEL,
    ...billingFromEnv()
  }
}

function buildSecondary() {
  return {
    id: 'secondary',
    baseUrl: (process.env.LLM_SECONDARY_BASE_URL || '').replace(/\/$/, ''),
    apiKey: process.env.LLM_SECONDARY_API_KEY || '',
    model: process.env.LLM_SECONDARY_MODEL || 'secondary-model',
    ...billingFromEnv()
  }
}

function defaultProviderId() {
  return process.env.LLM_DEFAULT_PROVIDER || 'deepseek'
}

/** Configured providers (stub: deepseek + secondary for switch tests). */
function listProviders() {
  const list = [buildDeepseek()]
  const secondary = buildSecondary()
  const stub = process.env.DEEPSEEK_STUB === '1'
  if (stub || (secondary.apiKey && secondary.baseUrl)) {
    if (stub && !secondary.baseUrl) {
      secondary.baseUrl = 'https://example.invalid/v1'
    }
    list.push(secondary)
  }
  return list
}

function resolveProvider(id) {
  const want = id || defaultProviderId()
  const found = listProviders().find((p) => p.id === want)
  if (!found) {
    const err = new Error('无效的 provider')
    err.status = 400
    err.code = 'INVALID_PROVIDER'
    throw err
  }
  return found
}

function isProviderConfigured(provider) {
  if (process.env.DEEPSEEK_STUB === '1') return true
  return !!(provider && provider.apiKey)
}

module.exports = {
  listProviders,
  resolveProvider,
  defaultProviderId,
  isProviderConfigured,
  buildDeepseek,
  billingFromEnv
}
