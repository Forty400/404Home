/** Rule-based assembly — no LLM. Silent read-only sources only. */

function assembleNewsDraft({ title, summary, body, sourceName, sourceUrl }) {
  const core = String(body || summary || '').trim()
  const content = [
    core || title,
    '',
    '## 出处',
    `本文为 404Home 站内整理稿，核心信息来自公开来源，未在源站互动。`,
    `出处：${sourceName || sourceUrl || '未知'} ${sourceUrl || ''}`.trim()
  ].join('\n')
  return {
    type: 'news',
    topic: 'news',
    title: String(title || '未命名资讯').slice(0, 200),
    summary: String(summary || core).slice(0, 240),
    content,
    source_name: sourceName || '',
    source_url: sourceUrl || '',
    lifecycle: 'pending_review',
    ingest: true,
    ingest_bot: 'news'
  }
}

function assembleGithubDraft({ fullName, description, readmeExcerpt, htmlUrl }) {
  const excerpt = String(readmeExcerpt || description || '').trim().slice(0, 4000)
  const content = [
    description || `${fullName} 公开仓库方法论摘录。`,
    '',
    '## README 摘录',
    excerpt || '（暂无 README 摘录）',
    '',
    '## 出处',
    `静默只读采集，未 Star/Fork/评论。仓库：${htmlUrl || fullName}`
  ].join('\n')
  return {
    type: 'tutorial',
    topic: 'method',
    title: `GitHub · ${fullName}`.slice(0, 200),
    summary: String(description || excerpt).slice(0, 240),
    content,
    source_name: fullName || 'GitHub',
    source_url: htmlUrl || '',
    lifecycle: 'pending_review',
    ingest: true,
    ingest_bot: 'github'
  }
}

module.exports = { assembleNewsDraft, assembleGithubDraft }
