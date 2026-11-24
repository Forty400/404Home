const SUFFIX = ' · 404Home'

const FALLBACK_BY_NAME = {
  home: 'AI 内容站',
  category: '工具分类',
  'tool-detail': '工具详情',
  search: '搜索工具',
  news: '每日资讯',
  'news-detail': '资讯',
  tutorials: '教程资源',
  'tutorial-detail': '教程',
  about: '关于',
  trial: 'DeepSeek 试用'
}

/**
 * @param {{ name?: string, meta?: { title?: string } }} routeLike
 */
export function resolveDocumentTitle(routeLike) {
  const metaTitle = routeLike?.meta?.title
  if (metaTitle) return `${metaTitle}${SUFFIX}`
  const fallback = FALLBACK_BY_NAME[routeLike?.name] || '404Home'
  return fallback === '404Home' ? '404Home' : `${fallback}${SUFFIX}`
}
