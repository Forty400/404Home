<template>
  <div class="page trial-page">
    <div class="container trial-layout">
      <header class="trial-head">
        <div>
          <h1>DeepSeek 试用</h1>
          <p class="sub">{{ modelHint }}</p>
        </div>
        <div v-if="user" class="balance-chip">
          <span>余额</span>
          <strong>¥{{ (user.balance_cents / 100).toFixed(2) }}</strong>
          <em>/ ¥{{ (user.balance_cap_cents / 100).toFixed(2) }}</em>
        </div>
      </header>

      <div v-if="!ready" class="card-panel state">加载中…</div>

      <div v-else-if="!user" class="preview card-panel">
        <div class="preview-copy">
          <h2>先看能力，再登录试用</h2>
          <p>
            DeepSeek 对话按用量从钱包余额扣费。新账号默认额度上限约
            <strong>¥3.00</strong>；会话保存在服务器，换设备可继续查看。
          </p>
          <ul class="quota-list">
            <li>未登录不会调用模型，下方仅为示例对话</li>
            <li>登录后即可发消息；余额不足时需管理员加额（作品集阶段无在线付款）</li>
          </ul>
          <div class="actions">
            <button
              type="button"
              class="btn btn-primary"
              @click="openLogin({ redirect: '/trial' })"
            >
              登录后试用
            </button>
            <button
              type="button"
              class="btn"
              @click="openRegister({ redirect: '/trial' })"
            >
              注册
            </button>
          </div>
        </div>
        <div class="demo" aria-hidden="true">
          <div class="bubble user">
            <span class="role">我</span>
            <p>用一句话解释什么是 RAG？</p>
          </div>
          <div class="bubble assistant">
            <span class="role">助手</span>
            <p>
              RAG 是「检索增强生成」：先从你的文档里找出相关片段，再让模型基于这些证据回答，减少胡编。
            </p>
            <small class="cost">示例 · 不扣费</small>
          </div>
        </div>
      </div>

      <div v-else class="workspace">
        <aside class="sidebar card-panel" :class="{ open: sidebarOpen }">
          <div class="side-top">
            <button type="button" class="btn btn-primary new-btn" @click="startNewChat">
              新对话
            </button>
            <button type="button" class="side-close" aria-label="关闭列表" @click="sidebarOpen = false">
              ×
            </button>
          </div>
          <p class="side-label">历史会话</p>
          <ul class="session-list">
            <li v-if="!sessions.length" class="side-empty">暂无记录，发送一条消息开始</li>
            <li
              v-for="s in sessions"
              :key="s.id"
              class="session-item"
              :class="{ active: sessionId === s.id }"
            >
              <button type="button" class="session-main" @click="openSession(s.id)">
                <span class="session-title">{{ s.title || '新对话' }}</span>
                <span class="session-time">{{ formatTime(s.updated_at) }}</span>
              </button>
              <button
                type="button"
                class="session-del"
                title="删除"
                aria-label="删除会话"
                @click.stop="removeSession(s.id)"
              >
                ×
              </button>
            </li>
          </ul>
        </aside>

        <div class="chat-shell card-panel">
          <div class="chat-toolbar">
            <button type="button" class="btn btn-ghost menu-btn" @click="sidebarOpen = !sidebarOpen">
              会话
            </button>
            <span class="chat-title">{{ currentTitle }}</span>
          </div>
          <div class="messages" ref="listEl">
            <div v-if="!messages.length" class="empty">
              向 DeepSeek 提问。回复按用量扣费；左侧可切换历史会话。
            </div>
            <div
              v-for="(m, i) in messages"
              :key="m.id || i"
              class="bubble"
              :class="m.role"
            >
              <span class="role">{{ m.role === 'user' ? '我' : '助手' }}</span>
              <p>{{ m.content }}</p>
              <small v-if="m.cost_cents" class="cost">本条约 ¥{{ (m.cost_cents / 100).toFixed(2) }}</small>
            </div>
          </div>
          <form class="composer" @submit.prevent="send">
            <textarea
              v-model="draft"
              rows="2"
              placeholder="输入消息…"
              :disabled="sending"
              @keydown.enter.exact.prevent="send"
            />
            <button
              v-if="sending"
              class="btn"
              type="button"
              @click="stopGenerate"
            >
              停止生成
            </button>
            <button class="btn btn-primary" type="submit" :disabled="sending || !draft.trim()">
              {{ sending ? '生成中…' : '发送' }}
            </button>
          </form>
          <p v-if="notice" class="notice" :class="{ err: noticeIsError }">{{ notice }}</p>
        </div>
      </div>
    </div>
    <div v-if="sidebarOpen" class="side-mask" @click="sidebarOpen = false" />
  </div>
</template>

<script>
import { useAuthModal } from '@/composables/useAuthModal'
import { useTrialChat } from '@/composables/useTrialChat'

export default {
  name: 'Trial',
  setup() {
    const { openLogin, openRegister, tick } = useAuthModal()
    const chat = useTrialChat({ authTick: tick })
    return { ...chat, openLogin, openRegister }
  }
}
</script>

<style scoped>
.trial-layout {
  display: grid;
  gap: 16px;
  max-width: 1100px;
}
.trial-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}
.trial-head h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 1.9rem);
}
.sub {
  margin: 6px 0 0;
  color: var(--ink-soft);
  font-size: 0.92rem;
}
.balance-chip {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--accent-soft);
  border: 1px solid var(--line);
  font-size: 0.9rem;
}
.balance-chip strong {
  color: var(--accent);
  font-size: 1.05rem;
}
.balance-chip em {
  font-style: normal;
  color: var(--ink-soft);
  font-size: 0.85rem;
}
.state {
  padding: 28px 22px;
}
.preview {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  padding: 22px;
  align-items: start;
}
.preview-copy h2 {
  margin: 0 0 8px;
  font-size: 1.2rem;
  font-family: var(--font-display);
}
.preview-copy p {
  margin: 0;
  color: var(--ink-soft);
  line-height: 1.6;
}
.quota-list {
  margin: 12px 0 0;
  padding-left: 1.1rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
  line-height: 1.55;
}
.demo {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  background: color-mix(in srgb, var(--ink) 3%, var(--bg));
  border: 1px solid var(--line);
}
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
@media (max-width: 800px) {
  .preview {
    grid-template-columns: 1fr;
  }
}
.workspace {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 14px;
  align-items: stretch;
  min-height: min(68vh, 640px);
}
.sidebar {
  display: flex;
  flex-direction: column;
  padding: 12px;
  min-height: 0;
  overflow: hidden;
}
.side-top {
  display: flex;
  gap: 8px;
  align-items: center;
}
.new-btn {
  flex: 1;
}
.side-close {
  display: none;
  border: none;
  background: transparent;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--ink-soft);
  cursor: pointer;
  padding: 4px 8px;
}
.side-label {
  margin: 12px 0 8px;
  font-size: 0.8rem;
  color: var(--ink-soft);
}
.session-list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  flex: 1;
  display: grid;
  gap: 4px;
  align-content: start;
}
.side-empty {
  color: var(--ink-soft);
  font-size: 0.88rem;
  padding: 8px 4px;
}
.session-item {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: stretch;
  border-radius: 10px;
  border: 1px solid transparent;
}
.session-item.active {
  background: var(--accent-soft);
  border-color: var(--line);
}
.session-main {
  text-align: left;
  border: none;
  background: transparent;
  padding: 10px 10px;
  cursor: pointer;
  min-width: 0;
  display: grid;
  gap: 2px;
  color: var(--ink);
}
.session-item:hover {
  background: var(--accent-soft);
}
.session-title {
  font-size: 0.9rem;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.session-time {
  font-size: 0.75rem;
  color: var(--ink-soft);
}
.session-del {
  border: none;
  background: transparent;
  color: var(--ink-soft);
  cursor: pointer;
  padding: 0 10px;
  font-size: 1.1rem;
}
.session-del:hover {
  color: var(--hot);
}
.chat-shell {
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  min-height: min(68vh, 640px);
  padding: 0;
  overflow: hidden;
}
.chat-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
}
.menu-btn {
  display: none;
}
.chat-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.messages {
  padding: 16px;
  overflow-y: auto;
  display: grid;
  gap: 12px;
  align-content: start;
}
.empty {
  color: var(--ink-soft);
  font-size: 0.95rem;
  line-height: 1.5;
  padding: 12px 4px;
}
.bubble {
  max-width: min(92%, 560px);
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: var(--bg-elevated);
}
.bubble.user {
  justify-self: end;
  background: var(--accent-soft);
}
.bubble .role {
  display: block;
  font-size: 0.75rem;
  color: var(--ink-soft);
  margin-bottom: 4px;
}
.bubble p {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.45;
  font-size: 0.95rem;
}
.cost {
  display: block;
  margin-top: 6px;
  color: var(--ink-soft);
  font-size: 0.75rem;
}
.composer {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 12px;
  border-top: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg-elevated) 90%, transparent);
}
.composer textarea {
  resize: vertical;
  min-height: 44px;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
  background: var(--bg-elevated);
  color: var(--ink);
}
.notice {
  margin: 0;
  padding: 0 12px 12px;
  font-size: 0.85rem;
  color: var(--ink-soft);
}
.notice.err {
  color: var(--hot);
}
.side-mask {
  display: none;
}
@media (max-width: 860px) {
  .workspace {
    grid-template-columns: 1fr;
  }
  .menu-btn {
    display: inline-flex;
  }
  .sidebar {
    position: fixed;
    z-index: 40;
    left: 0;
    top: 0;
    bottom: 0;
    width: min(300px, 86vw);
    border-radius: 0;
    transform: translateX(-105%);
    transition: transform 0.2s ease;
  }
  .sidebar.open {
    transform: translateX(0);
  }
  .side-close {
    display: inline-block;
  }
  .side-mask {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 35;
    background: color-mix(in srgb, var(--ink) 40%, transparent);
  }
}
@media (max-width: 560px) {
  .composer {
    grid-template-columns: 1fr;
  }
  .composer .btn {
    width: 100%;
  }
}
</style>
