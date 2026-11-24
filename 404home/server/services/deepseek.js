/**
 * Thin facade: keep historical require('./deepseek') shape; delegate to llm adapter.
 */
const llm = require('./llm')

function getConfig() {
  return llm.getConfig()
}

function isConfigured() {
  return llm.isConfigured('deepseek')
}

function usageToCents(usage) {
  return llm.usageToCents(usage, llm.getConfig())
}

async function chatCompletions(messages) {
  return llm.chat({ provider: 'deepseek', messages })
}

module.exports = { getConfig, isConfigured, usageToCents, chatCompletions }
