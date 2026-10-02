const bcrypt = require('bcryptjs')
const { db } = require('./db')

const CATEGORIES = [
  { name: 'AI写作工具', slug: 'writing', sort: 1 },
  { name: 'AI图像工具', slug: 'image', sort: 2 },
  { name: 'AI视频工具', slug: 'video', sort: 3 },
  { name: 'AI办公工具', slug: 'office', sort: 4 },
  { name: 'AI聊天助手', slug: 'chat', sort: 5 },
  { name: 'AI智能体', slug: 'agent', sort: 6 },
  { name: 'AI编程工具', slug: 'coding', sort: 7 },
  { name: 'AI开发平台', slug: 'platform', sort: 8 },
  { name: 'AI设计工具', slug: 'design', sort: 9 },
  { name: 'AI音频工具', slug: 'audio', sort: 10 },
  { name: 'AI搜索引擎', slug: 'search', sort: 11 },
  { name: 'AI学习网站', slug: 'learn', sort: 12 },
  { name: 'AI训练模型', slug: 'model', sort: 13 },
  { name: 'AI模型评测', slug: 'eval', sort: 14 },
  { name: 'AI内容检测', slug: 'detect', sort: 15 },
  { name: 'AI提示指令', slug: 'prompt', sort: 16 },
  { name: 'AI副业工具', slug: 'sidehustle', sort: 17 }
]

const TOOLS = [
  { name: 'ChatGPT', slug: 'chatgpt', summary: 'OpenAI 推出的 AI 聊天机器人', url: 'https://chatgpt.com', category: 'chat', tags: ['对话', '写作'], is_hot: 1 },
  { name: 'Claude', slug: 'claude', summary: 'Anthropic 推出的对话式 AI 智能助手', url: 'https://claude.ai', category: 'chat', tags: ['对话', '分析'], is_hot: 1 },
  { name: '豆包', slug: 'doubao', summary: '字节跳动推出的免费 AI 智能助手', url: 'https://www.doubao.com', category: 'chat', tags: ['对话', '国内'], is_hot: 1 },
  { name: 'Kimi', slug: 'kimi', summary: '月之暗面推出的长上下文 AI 助手', url: 'https://kimi.moonshot.cn', category: 'chat', tags: ['对话', '长文本'], is_hot: 1 },
  { name: 'DeepSeek', slug: 'deepseek', summary: '幻方量化推出的 AI 助手与开源大模型', url: 'https://chat.deepseek.com', category: 'chat', tags: ['对话', '开源'], is_hot: 1 },
  { name: '千问', slug: 'qwen', summary: '阿里通义千问全能 AI 助手', url: 'https://tongyi.aliyun.com', category: 'chat', tags: ['对话', '国内'] },
  { name: 'Gemini', slug: 'gemini', summary: 'Google 推出的多模态 AI 聊天助手', url: 'https://gemini.google.com', category: 'chat', tags: ['对话', '多模态'] },
  { name: '文心一言', slug: 'ernie', summary: '百度推出的文心大模型 AI 助手', url: 'https://yiyan.baidu.com', category: 'chat', tags: ['对话', '国内'] },

  { name: '蛙蛙写作', slug: 'wawa', summary: 'AI 小说和内容创作工具', url: 'https://www.wawa-ai.com', category: 'writing', tags: ['小说', '写作'], is_hot: 1 },
  { name: '笔灵AI写作', slug: 'bilin', summary: '模板丰富的 AI 写作与论文助手', url: 'https://ibiling.cn', category: 'writing', tags: ['论文', '写作'] },
  { name: '稿定AI文案', slug: 'gaoding-copy', summary: '小红书、公众号、短视频 AI 文案工具', url: 'https://www.gaoding.com', category: 'writing', tags: ['文案', '营销'] },
  { name: '办公小浣熊', slug: 'raccoon-office', summary: '文案生成与 AI 知识库创作', url: 'https://raccoon.sensetime.com', category: 'writing', tags: ['办公', '写作'], is_hot: 1 },

  { name: '即梦', slug: 'jimeng', summary: '抖音旗下免费 AI 图片创作工具', url: 'https://jimeng.jianying.com', category: 'image', tags: ['生图', '国内'], is_hot: 1 },
  { name: 'Midjourney', slug: 'midjourney', summary: '高质量 AI 图像与插画生成工具', url: 'https://www.midjourney.com', category: 'image', tags: ['生图', '插画'], is_hot: 1 },
  { name: 'LiblibAI', slug: 'liblib', summary: '国内领先的 AI 图像创作与模型社区', url: 'https://www.liblib.art', category: 'image', tags: ['生图', '社区'], is_hot: 1 },
  { name: '美图设计室', slug: 'meitu-design', summary: 'AI 图像创作和设计平台', url: 'https://www.meitu.com', category: 'image', tags: ['设计', '修图'] },
  { name: '通义万相', slug: 'wanxiang', summary: '阿里推出的 AI 创意内容生成平台', url: 'https://wanxiang.aliyun.com', category: 'image', tags: ['生图', '国内'] },

  { name: '可灵AI', slug: 'kling', summary: '快手推出的 AI 图像和视频创作平台', url: 'https://kling.kuaishou.com', category: 'video', tags: ['视频', '生图'], is_hot: 1 },
  { name: '即梦AI视频', slug: 'jimeng-video', summary: '一站式 AI 视频、图片、数字人创作', url: 'https://jimeng.jianying.com', category: 'video', tags: ['视频'], is_hot: 1 },
  { name: 'Runway', slug: 'runway', summary: '专业级 AI 视频生成与剪辑平台', url: 'https://runwayml.com', category: 'video', tags: ['视频', '剪辑'] },
  { name: 'Higgsfield', slug: 'higgsfield', summary: '支持专业运镜效果的 AI 视频工具', url: 'https://higgsfield.ai', category: 'video', tags: ['视频'], is_new: 1 },

  { name: 'AiPPT', slug: 'aippt', summary: 'AI 快速生成高质量 PPT', url: 'https://www.aippt.cn', category: 'office', tags: ['PPT'], is_hot: 1 },
  { name: 'Gamma', slug: 'gamma', summary: 'AI 幻灯片演示生成工具', url: 'https://gamma.app', category: 'office', tags: ['PPT', '演示'] },
  { name: '讯飞智文', slug: 'xunfei-doc', summary: '一键生成 PPT 和 Word', url: 'https://zhiwen.xfyun.cn', category: 'office', tags: ['PPT', '文档'] },
  { name: 'Notion AI', slug: 'notion-ai', summary: '嵌入 Notion 的 AI 文档与效率助手', url: 'https://www.notion.so', category: 'office', tags: ['文档', '效率'] },

  { name: 'Cursor', slug: 'cursor', summary: 'AI 代码编辑器，快速编程与软件开发', url: 'https://cursor.com', category: 'coding', tags: ['IDE', '编程'], is_hot: 1 },
  { name: 'TRAE', slug: 'trae', summary: '字节旗下 AI 编程工具', url: 'https://www.trae.ai', category: 'coding', tags: ['IDE', '编程'], is_hot: 1 },
  { name: 'GitHub Copilot', slug: 'copilot', summary: 'GitHub 推出的 AI 编程助手', url: 'https://github.com/features/copilot', category: 'coding', tags: ['插件', '编程'] },
  { name: '通义灵码', slug: 'tongyi-lingma', summary: '阿里推出的免费 AI 编程工具', url: 'https://lingma.aliyun.com', category: 'coding', tags: ['编程', '国内'] },
  { name: 'Claude Code', slug: 'claude-code', summary: 'Anthropic 推出的 AI 编程智能体', url: 'https://claude.ai', category: 'coding', tags: ['Agent', '编程'], is_new: 1 },

  { name: 'Dify', slug: 'dify', summary: '开源生成式 AI 应用开发平台', url: 'https://dify.ai', category: 'platform', tags: ['低代码', 'Agent'], is_hot: 1 },
  { name: '扣子', slug: 'coze', summary: '字节推出的 AI Bot 搭建平台', url: 'https://www.coze.cn', category: 'platform', tags: ['Bot', '国内'], is_hot: 1 },
  { name: 'n8n', slug: 'n8n', summary: '开源低代码 AI 工作流自动化工具', url: 'https://n8n.io', category: 'platform', tags: ['工作流'] },
  { name: 'OpenRouter', slug: 'openrouter', summary: '一个接口调用数百个 AI 模型', url: 'https://openrouter.ai', category: 'platform', tags: ['API', '聚合'] },

  { name: 'Lovart', slug: 'lovart', summary: '全球首个 AI 设计智能体', url: 'https://www.lovart.ai', category: 'agent', tags: ['设计', 'Agent'], is_hot: 1, is_new: 1 },
  { name: '秘塔AI搜索', slug: 'metaso', summary: '无广告、直达结果的 AI 搜索工具', url: 'https://metaso.cn', category: 'search', tags: ['搜索'], is_hot: 1 },
  { name: 'Perplexity', slug: 'perplexity', summary: 'AI 搜索引擎与深度研究工具', url: 'https://www.perplexity.ai', category: 'search', tags: ['搜索', '研究'], is_hot: 1 },
  { name: 'Suno', slug: 'suno', summary: '高质量 AI 音乐创作平台', url: 'https://suno.com', category: 'audio', tags: ['音乐'], is_hot: 1 },
  { name: 'ElevenLabs', slug: 'elevenlabs', summary: '多语言 AI 文本转语音与声音克隆', url: 'https://elevenlabs.io', category: 'audio', tags: ['配音', 'TTS'] },
  { name: 'Figma AI', slug: 'figma-ai', summary: 'Figma 原生 AI 设计能力', url: 'https://www.figma.com', category: 'design', tags: ['设计', 'UI'] },
  { name: '稿定AI', slug: 'gaoding-ai', summary: '一站式 AI 创作和设计平台', url: 'https://www.gaoding.com', category: 'design', tags: ['设计', '电商'] },
  { name: 'Ollama', slug: 'ollama', summary: '本地运行大语言模型', url: 'https://ollama.com', category: 'model', tags: ['本地', '开源'], is_hot: 1 },
  { name: '魔搭社区', slug: 'modelscope', summary: '阿里达摩院 AI 模型社区', url: 'https://www.modelscope.cn', category: 'model', tags: ['模型', '社区'] },
  { name: 'GPTZero', slug: 'gptzero', summary: '常用的免费 AI 内容检测工具', url: 'https://gptzero.me', category: 'detect', tags: ['检测'] },
  { name: '朱雀AI检测', slug: 'zhuque', summary: '腾讯推出的 AI 内容检测助手', url: 'https://matrix.tencent.com/ai-detect', category: 'detect', tags: ['检测', '国内'] },
  { name: 'PromptHero', slug: 'prompthero', summary: 'AI 提示词搜索与优化平台', url: 'https://prompthero.com', category: 'prompt', tags: ['提示词'] },
  { name: 'DeepLearning.AI', slug: 'deeplearning-ai', summary: '深度学习和人工智能学习平台', url: 'https://www.deeplearning.ai', category: 'learn', tags: ['课程'] },
  { name: 'Open LLM Leaderboard', slug: 'open-llm', summary: 'Hugging Face 开源大模型排行榜', url: 'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard', category: 'eval', tags: ['评测'] },
  { name: '知识星球', slug: 'zsxq', summary: '内容创作者的知识社群运营工具', url: 'https://www.zsxq.com', category: 'sidehustle', tags: ['变现', '社群'] }
]

const POSTS = [
  {
    type: 'news',
    title: '404Home 正式上线：精选常用 AI 工具导航',
    summary: '汇集写作、图像、编程、办公等分类，持续收录好用的 AI 工具。',
    content: '404Home 是一个面向日常使用的 AI 工具收录站。我们按场景整理常用工具，支持分类浏览与关键词搜索，并提供管理后台方便持续维护。欢迎收藏本站，后续会陆续补充资讯与教程资源。'
  },
  {
    type: 'news',
    title: '本周值得关注：Agent 与 AI 编程工具升温',
    summary: '智能体与 AI IDE 成为近期高频使用方向，推荐关注 Cursor、Claude Code、Dify 等。',
    content: '最近 AI 编程助手与 Agent 平台更新频繁。开发者可重点体验 Cursor、TRAE、Claude Code；产品与运营同学则可关注 Dify、扣子等低代码搭建平台，用工作流把重复任务自动化。'
  },
  {
    type: 'tutorial',
    title: '如何高效使用 AI 工具导航站',
    summary: '从分类、搜索到收藏外链，三步找到合适工具。',
    content: '1. 先从顶部分类进入你的使用场景（写作、图像、编程等）。\n2. 用搜索框输入关键词，如「PPT」「配音」「本地模型」。\n3. 点击「访问网站」跳转到官方站点试用。\n建议优先看「热门」标记的工具，通常更成熟、资料更全。'
  },
  {
    type: 'tutorial',
    title: '新手选聊天助手：国内与国际怎么选',
    summary: '按网络环境、中文能力、长文本需求做简单对比。',
    content: '国内网络优先：豆包、Kimi、DeepSeek、千问、文心一言。\n需要强推理与长文档：Claude、Kimi、ChatGPT。\n多模态图文：Gemini、豆包。\n建议各注册试用一次，保存自己最顺手的工作流，而不是追求「最强模型」。'
  }
]

function slugifyFallback(name) {
  return String(name)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
}

function seed() {
  const adminCount = db.prepare('SELECT COUNT(*) AS c FROM admins').get().c
  const catCount = db.prepare('SELECT COUNT(*) AS c FROM categories').get().c
  const toolCount = db.prepare('SELECT COUNT(*) AS c FROM tools').get().c
  const postCount = db.prepare('SELECT COUNT(*) AS c FROM posts').get().c

  const username = process.env.ADMIN_USERNAME || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'admin123'

  if (adminCount === 0) {
    const hash = bcrypt.hashSync(password, 10)
    db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash)
    console.log(`Seeded admin: ${username} / ${password}`)
  }

  if (catCount === 0) {
    const insertCat = db.prepare(
      'INSERT INTO categories (name, slug, parent_id, sort, icon) VALUES (?, ?, NULL, ?, ?)'
    )
    const tx = db.transaction(() => {
      for (const c of CATEGORIES) {
        insertCat.run(c.name, c.slug, c.sort, '')
      }
    })
    tx()
    console.log(`Seeded ${CATEGORIES.length} categories`)
  }

  if (toolCount === 0) {
    const cats = db.prepare('SELECT id, slug FROM categories').all()
    const catMap = Object.fromEntries(cats.map((c) => [c.slug, c.id]))
    const insertTool = db.prepare(`
      INSERT INTO tools (name, slug, summary, url, icon, category_id, tags, is_hot, is_new, enabled, sort)
      VALUES (@name, @slug, @summary, @url, @icon, @category_id, @tags, @is_hot, @is_new, 1, @sort)
    `)
    const tx = db.transaction(() => {
      TOOLS.forEach((t, index) => {
        insertTool.run({
          name: t.name,
          slug: t.slug || slugifyFallback(t.name),
          summary: t.summary,
          url: t.url,
          icon: t.icon || '',
          category_id: catMap[t.category] || null,
          tags: JSON.stringify(t.tags || []),
          is_hot: t.is_hot ? 1 : 0,
          is_new: t.is_new ? 1 : 0,
          sort: index + 1
        })
      })
    })
    tx()
    console.log(`Seeded ${TOOLS.length} tools`)
  }

  if (postCount === 0) {
    const insertPost = db.prepare(`
      INSERT INTO posts (type, title, summary, content, cover, published)
      VALUES (@type, @title, @summary, @content, '', 1)
    `)
    const tx = db.transaction(() => {
      for (const p of POSTS) insertPost.run(p)
    })
    tx()
    console.log(`Seeded ${POSTS.length} posts`)
  }
}

module.exports = { seed }

if (require.main === module) {
  require('dotenv').config()
  seed()
}
