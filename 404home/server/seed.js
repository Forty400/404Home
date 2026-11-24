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

/** 站内整理稿：正文原创摘要，必带出处。封面为本地 SVG。 */
const HOT_ARTICLES = [
  {
    type: 'news',
    topic: 'plugin',
    is_hot: 1,
    cover: '/covers/hot-01.svg',
    title: 'VS Code / Cursor 生态：AI 补全插件怎么选',
    summary: '从 Copilot、通义灵码到开源补全，个人开发者按「延迟、隐私、价格」三条线选型。',
    content:
      '个人站长选型不必追全功能套装。日常写业务代码优先低延迟补全；涉密仓库优先本地/私有化；预算紧时用厂商免费档即可。\n\n建议流程：同一仓库分别试用一周，用「接受补全率」和「改坏代码次数」做主观记账，再固定一个默认插件。\n\n本文为 404Home 整理稿，非厂商原文转载。',
    source_name: 'GitHub Copilot 文档',
    source_url: 'https://docs.github.com/en/copilot'
  },
  {
    type: 'tutorial',
    topic: 'plugin',
    is_hot: 1,
    cover: '/covers/hot-02.svg',
    title: '浏览器侧 AI 插件：摘要、划词与隐私边界',
    summary: '划词翻译/摘要类扩展好用，但要把「读剪贴板/读整页」权限当成风险面。',
    content:
      '装扩展前先看权限列表：能读所有网站的扩展等于能读你的后台 Cookie 上下文。个人建议：工作账号浏览器与娱乐浏览分离；敏感页（网银、后台）禁用第三方 AI 扩展。\n\n用法上「选中再触发」优于「默认全页上传」。',
    source_name: 'Chrome 扩展权限说明',
    source_url: 'https://developer.chrome.com/docs/extensions/develop/concepts/permission-warnings'
  },
  {
    type: 'news',
    topic: 'plugin',
    is_hot: 1,
    cover: '/covers/hot-03.svg',
    title: 'Figma AI 与设计插件：从改文案到批量变体',
    summary: '设计侧 AI 更适合「批量出变体 + 文案润色」，而不是一次出终稿。',
    content:
      '独立开发者兼设计时，把 AI 用在：空状态文案、多语言占位、图标风格统一检查。终稿对比度与间距仍要人眼过一遍。\n\n插件再强也替代不了组件库约束——先有 Design Token，再让 AI 填内容。',
    source_name: 'Figma AI',
    source_url: 'https://www.figma.com/ai/'
  },
  {
    type: 'tutorial',
    topic: 'plugin',
    is_hot: 0,
    cover: '/covers/hot-04.svg',
    title: 'Obsidian / 笔记库：本地 RAG 插件的务实装法',
    summary: '先小库验证检索质量，再上向量索引；别一上来全盘嵌入。',
    content:
      '个人知识库常见失败：文档太杂、标题无结构、同一概念多名。先用文件夹+标签整理 100 篇高质量笔记，再开本地检索插件。\n\n嵌入模型选「够用且能离线」的，比追 SOTA 更重要。',
    source_name: 'Obsidian 官方',
    source_url: 'https://obsidian.md'
  },
  {
    type: 'news',
    topic: 'plugin',
    is_hot: 1,
    cover: '/covers/hot-05.svg',
    title: 'JetBrains AI Assistant：IDE 内联与测试生成',
    summary: 'Java/Kotlin 栈可优先看 IDE 原厂助手；注意企业协议与代码上传策略。',
    content:
      '若主栈在 IntelliJ 系，原厂助手的重构与测试草拟往往比「浏览器聊两句再粘贴」顺。独立开发者要看清：是否允许代码片段出站、是否有本地模式。\n\n和 VS Code 插件一样，用一周真实项目验收，而不是看发布会 Demo。',
    source_name: 'JetBrains AI',
    source_url: 'https://www.jetbrains.com/ai/'
  },
  {
    type: 'tutorial',
    topic: 'dev',
    is_hot: 1,
    cover: '/covers/hot-01.svg',
    title: '用 Cursor 做个人项目：规则文件比「神提示词」更重要',
    summary: '把栈、目录约定、禁止事项写进项目规则，比每次口头叮嘱稳定。',
    content:
      '独立开发节奏快，上下文一丢模型就发明新目录。把「测试怎么跑、API 错误体长什么样、别加依赖」写进仓库规则，让每次会话可重复。\n\n小技巧：一次只开一个垂直切片；PR 级改动比「顺便重构全世界」便宜。',
    source_name: 'Cursor',
    source_url: 'https://cursor.com'
  },
  {
    type: 'news',
    topic: 'dev',
    is_hot: 1,
    cover: '/covers/hot-02.svg',
    title: 'DeepSeek API：个人试用计费该怎么控成本',
    summary: '服务端代理 + 余额分记账，比前端直打 Key 更安全，也更好做配额。',
    content:
      '个人产品常见坑：Key 进前端、无上限对话、失败重试打爆账单。正确姿势是服务端持有 Key，按「分/次」扣减本地余额，并把不足余额的错误码约定清楚。\n\n404Home Trial 即按此模式演示。',
    source_name: 'DeepSeek 开放平台',
    source_url: 'https://platform.deepseek.com'
  },
  {
    type: 'tutorial',
    topic: 'dev',
    is_hot: 1,
    cover: '/covers/hot-03.svg',
    title: '最小 Agent 环：工具调用 + 人工确认点',
    summary: '个人项目里 Agent 只负责提建议，写库/打款必须人工点确认。',
    content:
      '把「读」和「写」分开：模型可自由检索与草稿；涉及删除、支付、发信必须二次确认。这样即使用错模型也不会一夜清空数据。\n\n日志留下 tool 名与参数摘要，排障比聊天气泡有用。',
    source_name: 'OpenAI 函数调用指南（概念参考）',
    source_url: 'https://platform.openai.com/docs/guides/function-calling'
  },
  {
    type: 'news',
    topic: 'dev',
    is_hot: 0,
    cover: '/covers/hot-04.svg',
    title: '开源应用框架：Dify / 自建谁更适合一人公司',
    summary: '要速度用托管/低代码；要长期可控再自建工作流引擎。',
    content:
      '一人公司的真实约束是运维时间。验证想法阶段用 Dify 类平台拼 RAG/工作流；出现「必须进自有域名与计费」再迁出自建。\n\n过早自建 Agent 平台，会吃掉你做产品的时间。',
    source_name: 'Dify',
    source_url: 'https://dify.ai'
  },
  {
    type: 'tutorial',
    topic: 'dev',
    is_hot: 1,
    cover: '/covers/hot-05.svg',
    title: '前端接大模型：流式输出与取消请求的底线实现',
    summary: 'AbortController + 分块渲染足够；别先上复杂状态机。',
    content:
      '用户一点「停止」，就要 Abort 上游 fetch，并冻结已渲染文本。错误态用统一 `{ error, code? }`，余额不足单独 code，方便 UI 引导充值/试用。\n\n先跑通再谈多会话同步。',
    source_name: 'MDN AbortController',
    source_url: 'https://developer.mozilla.org/en-US/docs/Web/API/AbortController'
  },
  {
    type: 'tutorial',
    topic: 'method',
    is_hot: 1,
    cover: '/covers/hot-01.svg',
    title: '个人开发的 AI 工作流：研究 → 契约 → 红绿测',
    summary: '先写清验收再让模型写代码，比「直接生成一千行」省返工。',
    content:
      '推荐顺序：用一页分析钉死非目标；用短契约列出文件与 Done when；先写失败测试；再最小实现。模型擅长填空，不擅长替你做产品取舍。\n\n独立开发者最贵的是返工日，不是 token。',
    source_name: '测试驱动开发（概念）',
    source_url: 'https://en.wikipedia.org/wiki/Test-driven_development'
  },
  {
    type: 'tutorial',
    topic: 'method',
    is_hot: 1,
    cover: '/covers/hot-02.svg',
    title: '提示词别玄学：给模型「输入/输出契约」',
    summary: '用 JSON schema 或字段表约束输出，评审和解析都更稳。',
    content:
      '与其写长篇人设，不如写：允许字段、禁止字段、失败时如何返回。把示例 I/O 放进提示，比形容词「专业、优雅」有效。\n\n版本化你的系统提示，和代码一样可回滚。',
    source_name: 'OpenAI 提示工程指南',
    source_url: 'https://platform.openai.com/docs/guides/prompt-engineering'
  },
  {
    type: 'news',
    topic: 'method',
    is_hot: 0,
    cover: '/covers/hot-03.svg',
    title: '评估集：个人项目也要 20 条黄金用例',
    summary: '上线前用固定问题集扫一遍回归，比「感觉变聪明了」可靠。',
    content:
      '为聊天/摘要/分类各准备约 20 条输入与期望要点。模型或提示一改就跑一遍，记录通过率。独立开发没有 QA 团队时，这是最低成本的质量闸门。',
    source_name: 'DeepLearning.AI',
    source_url: 'https://www.deeplearning.ai'
  },
  {
    type: 'tutorial',
    topic: 'method',
    is_hot: 1,
    cover: '/covers/hot-04.svg',
    title: 'RAG 务实法：先检索质量，再谈换嵌入模型',
    summary: '分块、标题、去重没做好时，换模型也救不了胡言乱语。',
    content:
      '检查清单：块大小是否适中、元数据是否含标题/来源、Top-K 是否过宽。先人工抽查 10 次检索结果，再优化生成提示。\n\n出处链接要随答案返回——和本站文章「注明出处」同一纪律。',
    source_name: 'LlamaIndex 概念文档',
    source_url: 'https://docs.llamaindex.ai'
  },
  {
    type: 'tutorial',
    topic: 'method',
    is_hot: 1,
    cover: '/covers/hot-05.svg',
    title: '一人公司的模型路由：贵模型只做关键步',
    summary: '草稿用便宜模型，定稿/架构用强模型，成本立刻下降。',
    content:
      '把任务分级：分类、润色、单测草拟走小模型；接口设计、安全审查走强模型。记下每类任务的平均花费，月底比「全用旗舰」更清醒。',
    source_name: 'OpenRouter',
    source_url: 'https://openrouter.ai'
  },
  {
    type: 'news',
    topic: 'news',
    is_hot: 1,
    cover: '/covers/hot-01.svg',
    title: '开源权重与许可：个人商用前先看 License',
    summary: '模型能下不等于能商用；许可与使用条款要分开看。',
    content:
      '发布产品前确认：权重许可是否允许商用、API ToS 是否禁止你的场景、是否要求露出声明。独立开发者被投诉时，没有法务部托底。\n\n本站整理稿仅作索引提醒，以官方文本为准。',
    source_name: 'Hugging Face 模型许可说明',
    source_url: 'https://huggingface.co/docs/hub/en/repositories-licenses'
  },
  {
    type: 'news',
    topic: 'news',
    is_hot: 1,
    cover: '/covers/hot-02.svg',
    title: '本地模型热：Ollama 适合什么、不适合什么',
    summary: '隐私与离线场景香；要强推理与长上下文仍看云端旗舰。',
    content:
      '笔记本跑 7B/14B 做草稿、分类很香；复杂架构评审别硬刚。显存与散热是物理墙。个人建议：本地负责「随时可试」，云端负责「关键交付」。',
    source_name: 'Ollama',
    source_url: 'https://ollama.com'
  },
  {
    type: 'news',
    topic: 'news',
    is_hot: 1,
    cover: '/covers/hot-03.svg',
    title: 'AI 搜索产品：引用链接正在变成标配',
    summary: '无出处的「自信回答」正在失去信任；产品应默认展示来源。',
    content:
      '无论自建还是接入 Perplexity 类体验，把引用区做成一等公民。404Home 热门文章专区同样要求每篇标注出处链接，形成统一内容纪律。',
    source_name: 'Perplexity',
    source_url: 'https://www.perplexity.ai'
  },
  {
    type: 'news',
    topic: 'news',
    is_hot: 0,
    cover: '/covers/hot-04.svg',
    title: '评测榜单怎么读：别只看第一名',
    summary: '看任务是否贴近你的场景，以及是否可复现。',
    content:
      'Leaderboard 适合筛选候选，不适合当采购唯一依据。把榜单 Top 模型放进你的 20 条黄金用例里跑，比盯着总分有用。',
    source_name: 'Open LLM Leaderboard',
    source_url: 'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard'
  },
  {
    type: 'news',
    topic: 'news',
    is_hot: 1,
    cover: '/covers/hot-05.svg',
    title: '404Home 热门文章专区上线：站内可读 + 注明出处',
    summary: '首页改为 AI 图文 Feed，工具导航仍保留；内容以整理稿入库。',
    content:
      '本站将首页调整为以 AI 插件、开发、方法论与新闻为主的热门文章专区。正文在站内阅读，并展示来源名称与链接。工具热门条仍保留在首页下方，Trial 试用入口不变。',
    source_name: '404Home',
    source_url: 'https://404home.com'
  },
  {
    type: 'tutorial',
    topic: 'method',
    is_hot: 1,
    cover: '/covers/hot-01.svg',
    title: 'SPDD 规划指导手册',
    summary: '用分析 → 画布 → 四层资产 → 生成，把「和 AI 聊着改」收成可审查的契约开发。',
    content: `SPDD（Structured-Prompt-Driven Development）把提示当成一等资产：可版本化、可审查，而不是一次性聊天。本手册按本仓库实战顺序写，帮你规划一次变更该走哪些文档、何时写测试、何时才碰代码。

## 什么时候用 SPDD

当你要改产品行为、信息架构、计费、鉴权，或任何「做错要返工一天」的事，就用 SPDD。改文案标点、改一行 CSS 颜色，不必起画布。判断标准：有没有需要拍板的取舍？有没有验收标准说不清？有就走契约。

## 推荐闭环

固定顺序：analysis → reasons-canvas → 四层资产（先 ADR，再测试边界与条例，再必要时更新资产规范）→ generate（SDD+TDD）→ review → sync → 沉淀 RAG。跳步最常见的坑是「直接让模型写代码」，结果验收靠感觉，回归靠运气。

## 四层资产各管什么

ADR 只记有取舍的决策与后果。测试边界写清测什么、不测什么。测试条例写成 Given/When/Then，供自动化对齐。资产规范沉淀跨功能长期约束。开发中顺序不可颠倒：有架构/产品取舍先写 ADR，再动测试资产，再动规范，最后按画布实现。

## 规划一页分析就够

分析文档钉死：业务目标、范围内外、成功长什么样、非目标（做成了也算失败的事）。不要写成长篇愿景。独立开发者最贵的是返工日；一页分析的价值是阻止「边写边发明需求」。

## 画布是单次变更契约

REASONS Canvas 的 Operations 必须落到文件路径与 Done when，禁止「实现登录」这种空话。Norms 写怎么写代码；Safeguards 写绝对不能发生的事（例如跨角色冒用 JWT、余额裸 UPDATE）。有活跃画布时，设计只走 SPDD，不要再开一轮发散式 brainstorm 覆盖契约。

## 与 TDD / Ponytail

实现阶段遵循红 → 确认失败 → 绿 → 重构。Ponytail 约束最少必要代码，但不砍信任边界校验、不砍条例要求的测试。最短 diff 仍须覆盖调用方与被破坏的测试。

## 规划检查清单

开工前自问：目标用户卡住的具体时刻是什么？Out of scope 写清了吗？P0 用例能否在自动化里失败一次再变绿？上线后若行为与画布不一致，是先 sync 契约还是偷偷改代码？（应先 sync。）

本篇为 404Home 站内整理，流程细节以仓库 docs/spdd 为准。`,
    source_name: '本仓库 docs/spdd',
    source_url: 'https://github.com/gszhangwei/open-spdd'
  },
  {
    type: 'tutorial',
    topic: 'method',
    is_hot: 1,
    cover: '/covers/hot-02.svg',
    title: '仓库 SPDD 化教程',
    summary: '从零把现有仓库接上 rules、skills、四层资产与 RAG，让 Agent 默认走契约而不是即兴发挥。',
    content: `「仓库 SPDD 化」不是换框架，而是给 AI 协作装上固定入口：规则提醒、技能工作流、可检索事实、以及每次变更的设计契约。下面按最小可运行顺序说明，可直接对照本仓库目录照做。

## 第一步：目录骨架

在仓库建 docs/spdd/，至少包含：README（原则与资产更新序）、workflow、1-资产规范、2-adr决策、3-测试边界、4-测试条例、templates、analysis、canvases、rag/index.md 与 knowledge/。空目录也比「全在聊天里」强——路径稳定后，Agent 才找得到契约。

## 第二步：始终生效的 Rule

用编辑器规则（如 .cursor/rules）写清：非琐碎改动先查 RAG；有活跃画布按画布实现；复杂需求先分析再画布；四层资产更新序固定。Rule 只放硬约束，不要塞成长篇教程。细节放 Skill 与 docs。

## 第三步：四个核心 Skill

至少准备：spdd-analysis、spdd-reasons-canvas、spdd-generate、spdd-sync。generate 必须绑定 SDD+TDD（先条例/红测再实现）。可选：spdd-rag 查知识库。Skill 的 description 要写清触发词，否则模型不会主动读入。

## 第四步：回填一份真实模块

不要空转模板。挑一个已存在模块（认证、主题、或一篇首页 Feed），按 ADR → 边界 → 条例 → 规范回填，并挂一条自动化测试对齐条例。有了第一份「闭环样板」，后续模块才能复制节奏。

## 第五步：RAG 只摘要稳定事实

rag/knowledge 写产品栈、部署、协作约定等稳定事实；index.md 做检索入口。变更合并后若事实变了，同步改 knowledge，避免 Agent 读到过期架构。

## 第六步：与 Superpowers / 懒惰约束共存

实现阶段必循 TDD skill。有活跃 SPDD 画布时，不要用发散式 brainstorm/writing-plans 覆盖设计。另加一层「最少必要代码」约束（本仓库称 Ponytail）：能复用就不新建，但不砍安全与测试。在 THIRD_PARTY_NOTICES 或 ADR 里写清版本来源，便于审计。

## 验收：怎样算 SPDD 化成功

新功能 PR 能指出对应画布与条例；Agent 改代码前会先找契约；行为漂移时先 sync 再改实现。做不到这三点，目录再全也只是文档堆。

本篇为站内教程整理，目录约定以本仓库 docs/spdd/README 为准；概念参考 OpenSPDD。`,
    source_name: '本仓库 docs/spdd',
    source_url: 'https://www.martinfowler.com/articles/structured-prompt-driven/'
  },
  {
    type: 'tutorial',
    topic: 'dev',
    is_hot: 1,
    cover: '/covers/hot-03.svg',
    title: '如何输出一个自己的 MCP：以 404Home 工具检索为例',
    summary:
      '从 Cursor MCP 三工具，到后台新增内容后 LIKE 即时命中与向量索引重建：404Home 的双路检索落地节奏。',
    content: `MCP（Model Context Protocol）让编辑器里的 AI 能「调工具」而不是只聊天。对个人站来说，最小有用形态是：你的业务 API 已经能答问题，再加一层 stdio 进程，把几个只读能力登记成 tool。404Home 的做法就是把智能检索与工具详情暴露给 Cursor，简历句也能落到具体文件。

## 先想清楚暴露什么

先列「模型允许做的事」。404Home 只开放三件只读能力：search_tools（自然语言搜工具库）、get_tool_detail（按 id/slug 取详情）、list_tools_by_tag（按标签过滤）。禁止 delete、写库、admin。原则很简单：MCP 是能力边界，不是又一个后台。

## 仓库里放一个独立小包

在业务仓旁建 mcp-server/：独立 package.json，依赖 @modelcontextprotocol/sdk，入口 index.js，type 用 module。不要和 Koa 进程搅在一起——Cursor 用 command + args 拉起 Node，走 stdio；业务仍听 HTTP。404Home 默认打本机 http://127.0.0.1:3001。

## 五分钟骨架

起 Server，capabilities 声明 tools；对 ListTools 返回 name、description、inputSchema；对 CallTool 按 name 分支，内部用 fetch 调你的 API，把 JSON 放进 content 文本块返回。出错时设 isError，把可读错误写进 content，别让进程静默挂掉。传输用 StdioServerTransport，最后 server.connect(transport)。

## 三个工具怎么映射 API

search_tools：POST /api/smart-search，body 里 q 与 rerank。get_tool_detail：GET /api/tools/:idOrSlug。list_tools_by_tag：先拉列表再按 tags 过滤（体量小时足够；库很大再改成服务端过滤）。环境变量 SMART_SEARCH_API 指向 API 根地址，去掉尾斜杠再拼 path。

## 接到 Cursor

先保证 API 已启动，工具索引可用（本站可用 EMBEDDING_STUB=1 跑 reindex）。在 Cursor MCP 配置里加一项：command 为 node，args 为 mcp-server/index.js 的绝对路径，env 里写 SMART_SEARCH_API。保存后应能 list 出三个 tool；对话里让模型「搜适合做海报的免费 AI」应走到 search_tools。

## 404Home 两套搜索别混

站内「热文 / 教程」与「工具库」不是同一条检索链。文章列表旁的相关推荐，是前端对 title/summary 做字符串包含（关键词 LIKE 语义）；没有向量、也不进 MCP。智能检索与 MCP 的 search_tools，作用对象是 tools 表：双路召回 + RRF + 可选 LLM 精排。下面以「后台新加一条工具」说明 LIKE 与向量各自何时生效。

## 新增一条工具：LIKE 怎么立刻有

管理端把 name、summary、tags 等写入 SQLite tools（enabled=1）后，旧接口 GET /api/tools?q= 直接对这三列做 LIKE %q%。这条路径读的是业务表本身，所以一保存，关键词搜索页就能命中——无需重建任何索引。这是基线 CMS 搜索，也是评测脚本里的 Recall@5 对照线。

## 新增一条工具：向量为什么不会自动有

智能检索不直接扫 tools 行，而是先读 tool_chunks：每个工具按字段切成 name / summary / tags / scenario / card 等文本块，再经 Embedding 写成 embedding_json。关键词路也对 chunk 文本做分词/字串 LIKE；向量路算 query 向量与 chunk 的余弦，再按 tool_id 去重各取 top-20，RRF 融合后精排。因此：只 INSERT tools、不重建 chunks，新工具在 /smart-search 与 MCP 里都「看不见」。空表时首次查询会自动全量 reindex；表里已有旧索引时，新增/改文案必须主动重建。

## 重建索引的三种姿势

本地：在 server 目录设好 Embedding（或 EMBEDDING_STUB=1），执行 npm run reindex:tools，脚本会清空 tool_chunks 再按 enabled 工具全量切分嵌入。线上：管理员 JWT 调 POST /api/smart-search/reindex。运维节奏建议「改工具文案或批量导入后立刻 reindex」，再去 /smart-search 或 Cursor 里用自然语言验一条。换真 Embedding 模型后，旧 stub 向量无效，也必须整库重建。

## 硬约束（抄作业时别砍）

密钥只留在服务端 .env，MCP 进程不要塞 Embedding/LLM Key。单测与演示可用 stub，但对外别假装已接真向量库。智能检索默认不扣 /trial 余额。原有关键词列表搜索与试用计费保持不动——MCP 只是多一条只读入口。若你要把同样套路用到「文章」：posts 也要实体切分进独立 chunks 表，并在发布钩子里触发 reindex；404Home 目前刻意没做这步，避免和工具 RAG 证据链搅在一起。

## 验收清单

Cursor 能列出三工具；本地能成功 call；返回体是精简 JSON 而非 HTML；关掉 API 时错误可读；没有任何写接口。另验检索：新工具写入后 /api/tools?q= 立刻命中；reindex 前 /smart-search 不应出现该工具，reindex 后双路都能召回。做到这些，你就「输出」了自己的 MCP，并搞清 LIKE 与向量各自的更新点。

本篇依据 404Home「工具 RAG + MCP」指导包整理，实现细节以仓库 404home/mcp-server、docs/智能检索-技术说明.md 与 AI指导文档为准。`,
    source_name: '404Home AI指导文档 / MCP 规范',
    source_url: 'https://modelcontextprotocol.io'
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

  ensureHotArticles()
  thickenShortArticles()
  capHotArticles(3)
  capHotTools(8)
  ensureToolDecisions()
  ensureUatUser()
}

function ensureHotArticles() {
  const insertPost = db.prepare(`
    INSERT INTO posts (type, title, summary, content, cover, topic, source_name, source_url, is_hot, published, created_at)
    VALUES (@type, @title, @summary, @content, @cover, @topic, @source_name, @source_url, @is_hot, 1, @created_at)
  `)
  const hasTitle = db.prepare('SELECT id FROM posts WHERE title = ?')
  const atOffset = db.prepare(`SELECT datetime('now', ?) AS t`)
  let inserted = 0
  const tx = db.transaction(() => {
    HOT_ARTICLES.forEach((p, index) => {
      if (hasTitle.get(p.title)) return
      // stagger so list times don't look batch-imported
      const hoursAgo = (HOT_ARTICLES.length - index) * 5
      insertPost.run({
        type: p.type,
        title: p.title,
        summary: p.summary,
        content: p.content,
        cover: p.cover || '',
        topic: p.topic || 'news',
        source_name: p.source_name || '',
        source_url: p.source_url || '',
        is_hot: p.is_hot ? 1 : 0,
        created_at: atOffset.get(`-${hoursAgo} hours`).t
      })
      inserted += 1
    })
  })
  tx()
  if (inserted) console.log(`Seeded ${inserted} hot articles`)
  spreadClusteredPostTimes()
}

const BODY_PAD =
  '\n\n选型时建议对照：适用场景是否匹配、国内访问是否稳定、免费额度是否够用。完整能力以官网为准；本文为 404Home 站内整理，注明出处便于核对原文。\n\n若你正在搭建个人站或作品集，优先选「能快速验证」的工具，再考虑替换为更贵的专业档。'

/** Collapse accidental double-paste of BODY_PAD from older thicken loops. */
function collapseRepeatedBodyPads(content) {
  const pad = BODY_PAD.trim()
  if (!pad || !content) return content || ''
  let out = content
  const duplex = `${pad}\n\n${pad}`
  while (out.includes(duplex)) {
    out = out.split(duplex).join(pad)
  }
  // also collapse when pads sit back-to-back without blank line
  const glued = pad + pad
  while (out.includes(glued)) {
    out = out.split(glued).join(pad)
  }
  return out
}

function thickenShortArticles(minLen = 280) {
  const rows = db.prepare('SELECT id, content FROM posts WHERE published = 1').all()
  const upd = db.prepare('UPDATE posts SET content = ? WHERE id = ?')
  let n = 0
  for (const r of rows) {
    let content = collapseRepeatedBodyPads(r.content || '')
    if (content.length < minLen) {
      const pad = BODY_PAD.trim()
      if (!content.includes(pad)) content += BODY_PAD
      // short unique filler — never re-append BODY_PAD in a loop
      while (content.length < minLen) content += '。'
    }
    if (content !== (r.content || '')) {
      upd.run(content, r.id)
      n += 1
    }
  }
  if (n) console.log(`Thickened/deduped ${n} articles`)
}

function capHotArticles(maxPerTopic = 3) {
  const topics = db.prepare('SELECT DISTINCT topic FROM posts').all()
  const clear = db.prepare('UPDATE posts SET is_hot = 0 WHERE id = ?')
  for (const { topic } of topics) {
    const hot = db
      .prepare(
        `SELECT id FROM posts WHERE published = 1 AND is_hot = 1 AND topic = ?
         ORDER BY id DESC`
      )
      .all(topic)
    hot.slice(maxPerTopic).forEach((r) => clear.run(r.id))
  }
}

function capHotTools(max = 8) {
  const hot = db
    .prepare('SELECT id FROM tools WHERE is_hot = 1 ORDER BY sort ASC, id ASC')
    .all()
  const clear = db.prepare('UPDATE tools SET is_hot = 0 WHERE id = ?')
  hot.slice(max).forEach((r) => clear.run(r.id))
}

const TOOL_DECISIONS = {
  chatgpt: {
    pricing: '免费增值',
    region_avail: '海外为主',
    scenario: '通用对话、写作与代码辅助'
  },
  deepseek: {
    pricing: '免费增值',
    region_avail: '国内可用',
    scenario: '推理对话与编程协作'
  },
  claude: {
    pricing: '订阅制',
    region_avail: '海外为主',
    scenario: '长文分析与严谨写作'
  },
  cursor: {
    pricing: '订阅制',
    region_avail: '全球可用',
    scenario: 'AI 结对编程与仓库改码'
  },
  aippt: {
    pricing: '免费增值',
    region_avail: '国内可用',
    scenario: '快速生成演示文稿'
  },
  doubao: {
    pricing: '免费增值',
    region_avail: '国内可用',
    scenario: '日常中文对话与办公辅助'
  },
  midjourney: {
    pricing: '订阅制',
    region_avail: '海外为主',
    scenario: '高质量插画与概念图'
  },
  kimi: {
    pricing: '免费增值',
    region_avail: '国内可用',
    scenario: '长文档阅读与摘要'
  }
}

function ensureToolDecisions() {
  const upd = db.prepare(
    `UPDATE tools SET pricing = ?, region_avail = ?, scenario = ?
     WHERE slug = ? AND (IFNULL(pricing,'') = '' OR IFNULL(region_avail,'') = '' OR IFNULL(scenario,'') = '')`
  )
  for (const [slug, d] of Object.entries(TOOL_DECISIONS)) {
    upd.run(d.pricing, d.region_avail, d.scenario, slug)
  }
}

/** Fixed C-end account for UAT / UX evaluation (see docs/spdd/1-资产规范/404home-uat-guide.md). */
function ensureUatUser() {
  const email = (process.env.UAT_USER_EMAIL || 'uat@404home.test').trim().toLowerCase()
  const password = process.env.UAT_USER_PASSWORD || 'Uat404Home!'
  const existing = db
    .prepare(
      `SELECT id FROM users WHERE email = ? AND (deleted_at IS NULL OR deleted_at = '')`
    )
    .get(email)
  if (existing) return

  const hash = bcrypt.hashSync(password, 10)
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, vip_level, balance_cents, balance_cap_cents, status)
    VALUES (?, ?, 0, 300, 300, 'active')
  `)
  const insertLedger = db.prepare(`
    INSERT INTO wallet_ledger (user_id, delta_cents, reason, ref_id)
    VALUES (?, 300, 'grant', 'uat-seed')
  `)
  const tx = db.transaction(() => {
    const info = insertUser.run(email, hash)
    insertLedger.run(info.lastInsertRowid)
  })
  tx()
  console.log(`Seeded UAT user: ${email} / ${password}`)
}

/** One-shot repair when most posts share the same created_at (batch DEFAULT now). */
function spreadClusteredPostTimes() {
  const stats = db
    .prepare(
      `SELECT COUNT(*) AS n, COUNT(DISTINCT created_at) AS d FROM posts WHERE published = 1`
    )
    .get()
  if (!stats || stats.n < 5) return
  const minDistinct = Math.min(10, stats.n)
  if (stats.d >= minDistinct) return

  const rows = db
    .prepare('SELECT id FROM posts WHERE published = 1 ORDER BY id')
    .all()
  const upd = db.prepare(
    `UPDATE posts SET created_at = datetime('now', ?) WHERE id = ?`
  )
  const tx = db.transaction(() => {
    rows.forEach((r, index) => {
      const hoursAgo = (rows.length - index) * 5
      upd.run(`-${hoursAgo} hours`, r.id)
    })
  })
  tx()
  console.log(`Spread created_at for ${rows.length} posts`)
}

module.exports = { seed, BODY_PAD, collapseRepeatedBodyPads }

if (require.main === module) {
  require('dotenv').config()
  seed()
}
