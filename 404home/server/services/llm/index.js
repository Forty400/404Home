const {
  listProviders,
  resolveProvider,
  defaultProviderId,
  isProviderConfigured,
  buildDeepseek
} = require('./providers')
const {
  chatCompletions: openaiChat,
  chatStream: openaiStream,
  usageToCents
} = require('./openaiCompat')

function getConfig() {
  const p = buildDeepseek()
  return {
    apiKey: p.apiKey,
    baseUrl: p.baseUrl,
    model: p.model,
    inputUsdPerMTok: p.inputUsdPerMTok,
    outputUsdPerMTok: p.outputUsdPerMTok,
    usdCny: p.usdCny,
    markup: p.markup,
    maxHistory: Number(process.env.CHAT_MAX_HISTORY || 20)
  }
}

function isConfigured(providerId) {
  try {
    const p = resolveProvider(providerId)
    return isProviderConfigured(p)
  } catch {
    return false
  }
}

function getStatus() {
  const providers = listProviders()
  const configuredIds = providers
    .filter((p) => isProviderConfigured(p))
    .map((p) => p.id)
  const defaultId = defaultProviderId()
  let current
  try {
    current = resolveProvider(defaultId)
  } catch {
    current = providers[0]
  }
  return {
    configured: configuredIds.length > 0 && isProviderConfigured(current),
    provider: current?.id || defaultId,
    model: current?.model || getConfig().model,
    providers: configuredIds
  }
}

async function chat({ provider: providerId, messages } = {}) {
  const provider = resolveProvider(providerId)
  if (!isProviderConfigured(provider)) {
    const err = new Error('DeepSeek API Key 未配置')
    err.status = 503
    err.code = 'DEEPSEEK_NOT_CONFIGURED'
    throw err
  }
  return openaiChat(provider, messages)
}

async function* chatStream({ provider: providerId, messages, signal } = {}) {
  const provider = resolveProvider(providerId)
  if (!isProviderConfigured(provider)) {
    const err = new Error('DeepSeek API Key 未配置')
    err.status = 503
    err.code = 'DEEPSEEK_NOT_CONFIGURED'
    throw err
  }
  yield* openaiStream(provider, messages, { signal })
}

module.exports = {
  chat,
  chatStream,
  getStatus,
  listProviders,
  resolveProvider,
  getConfig,
  isConfigured,
  usageToCents
}
