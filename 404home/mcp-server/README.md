# 404Home MCP Server

只读三工具，经 HTTP 调用本机 API（默认 `http://127.0.0.1:3001`）。

| Tool | 作用 |
| --- | --- |
| `search_tools` | `POST /api/smart-search` |
| `get_tool_detail` | `GET /api/tools/:idOrSlug` |
| `list_tools_by_tag` | 拉列表后按 tag 过滤 |

## 安装

```bash
cd mcp-server
npm install
```

先起 API（`npm run server` 于 `404home/`），建议：

```bash
cd ../server
set EMBEDDING_STUB=1
npm run reindex:tools
```

## Cursor 配置示例

在 Cursor MCP 设置中加入（路径按本机修改）：

```json
{
  "mcpServers": {
    "404home-tools": {
      "command": "node",
      "args": ["E:/AAAproject/AI_SPACE/404home/mcp-server/index.js"],
      "env": {
        "SMART_SEARCH_API": "http://127.0.0.1:3001"
      }
    }
  }
}
```

然后在对话里可调用 `search_tools` 等。
