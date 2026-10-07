<template>
  <div class="password-wrap">
    <input
      :value="modelValue"
      :type="visible ? 'text' : 'password'"
      :autocomplete="autocomplete"
      :minlength="minlength || undefined"
      :required="required"
      :placeholder="placeholder"
      class="password-input"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <button
      type="button"
      class="eye-btn"
      :aria-label="visible ? '隐藏密码' : '显示密码'"
      :title="visible ? '隐藏密码' : '显示密码'"
      @click="visible = !visible"
    >
      <svg v-if="!visible" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 5c-5 0-9.27 3.11-11 7 1.73 3.89 6 7 11 7s9.27-3.11 11-7c-1.73-3.89-6-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 .001 6.001A3 3 0 0 0 12 9z"
        />
      </svg>
      <svg v-else viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
        <path
          fill="currentColor"
          d="M3.27 2L2 3.27l2.11 2.11A11.8 11.8 0 0 0 1 12c1.73 3.89 6 7 11 7 1.79 0 3.48-.4 5-1.1L20.73 22 22 20.73 3.27 2zM12 17c-2.76 0-5-2.24-5-5 0-.77.18-1.5.49-2.14l1.57 1.57c-.03.19-.06.38-.06.57a3 3 0 0 0 3 3c.19 0 .38-.03.57-.06l1.57 1.57A4.93 4.93 0 0 1 12 17zm9.5-1.5-2.05-2.05c.35-.76.55-1.59.55-2.45 0-3.89-4.27-7-10-7-1.04 0-2.04.14-2.98.39L5.39 2.76A12.4 12.4 0 0 1 12 5c5 0 9.27 3.11 11 7a12.4 12.4 0 0 1-1.5 3.5z"
        />
      </svg>
    </button>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'PasswordInput',
  props: {
    modelValue: { type: String, default: '' },
    autocomplete: { type: String, default: 'current-password' },
    minlength: { type: [Number, String], default: null },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: '' }
  },
  emits: ['update:modelValue'],
  setup() {
    const visible = ref(false)
    return { visible }
  }
}
</script>

<style scoped>
.password-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 42px 10px 12px;
  background: #fff;
  box-sizing: border-box;
}

.eye-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--ink-soft);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.eye-btn:hover {
  color: var(--accent);
  background: var(--accent-soft);
}
</style>
