#!/usr/bin/env node
/**
 * 404Home MCP Server — read-only tools over HTTP API.
 * Requires API running (default http://127.0.0.1:3001).
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js'

const API = (process.env.SMART_SEARCH_API || 'http://127.0.0.1:3001').replace(/\/$/, '')

async function api(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  return data
}

const server = new Server(
  { name: '404home-tools', version: '1.0.0' },
  { capabilities: { tools: {} } }
)

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_tools',
      description: '智能检索 404Home 工具库，返回 top-5 与命中理由',
      inputSchema: {
        type: 'object',
        properties: { query: { type: 'string', description: '自然语言查询' } },
        required: ['query']
      }
    },
    {
      name: 'get_tool_detail',
      description: '按 id 或 slug 获取单个工具详情',
      inputSchema: {
        type: 'object',
        properties: { idOrSlug: { type: 'string' } },
        required: ['idOrSlug']
      }
    },
    {
      name: 'list_tools_by_tag',
      description: '按标签过滤工具列表',
      inputSchema: {
        type: 'object',
        properties: { tag: { type: 'string' } },
        required: ['tag']
      }
    }
  ]
}))

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params
  try {
    let payload
    if (name === 'search_tools') {
      payload = await api('POST', '/api/smart-search', { q: args.query, rerank: true })
    } else if (name === 'get_tool_detail') {
      payload = await api('GET', `/api/tools/${encodeURIComponent(args.idOrSlug)}`)
    } else if (name === 'list_tools_by_tag') {
      const all = await api('GET', '/api/tools?pageSize=200')
      const tag = String(args.tag || '').toLowerCase()
      payload = {
        items: (all.items || []).filter((t) =>
          (t.tags || []).some((x) => String(x).toLowerCase().includes(tag))
        )
      }
    } else {
      throw new Error(`Unknown tool: ${name}`)
    }
    return {
      content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }]
    }
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: err.message || String(err) }]
    }
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
