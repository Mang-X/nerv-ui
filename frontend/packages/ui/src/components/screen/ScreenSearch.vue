<script setup lang="ts">
import { Search, X } from '@lucide/vue'

/**
 * Screen — big-board search box. A lucide search glyph anchors the left, the
 * well carries the shared `.nv-focusable` brand ring on focus, and once there's
 * text a clear button (×) appears to wipe it. Built on the independent
 * `--nv-scr-*` tokens via `v-model` (string).
 */
const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{ placeholder?: string; disabled?: boolean; ariaLabel?: string }>(),
  {
    placeholder: '搜索工单号 / 产线 / 设备',
    disabled: false,
    ariaLabel: '搜索',
  },
)

function clear() {
  if (props.disabled) return
  model.value = ''
}
</script>

<template>
  <div class="nv-scr-se nv-focusable" :class="{ disabled }">
    <Search class="nv-scr-se-icon" :size="16" aria-hidden="true" />
    <input
      v-model="model"
      class="nv-scr-se-field"
      type="search"
      :aria-label="ariaLabel"
      :placeholder="placeholder"
      :disabled="disabled"
    />
    <button
      v-if="model"
      type="button"
      class="nv-scr-se-clear nv-focusable"
      aria-label="清除"
      :disabled="disabled"
      @click="clear"
    >
      <X :size="14" />
    </button>
  </div>
</template>

<style scoped>
@layer nv-components {
  .nv-scr-se {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: 38px;
    padding: 0 10px;
    border-radius: var(--nv-scr-radius);
    background: rgba(255, 255, 255, 0.025);
    isolation: isolate;
    box-shadow:
      inset 0 1px 0 var(--nv-scr-highlight),
      inset 0 1px 2px rgba(0, 0, 0, 0.4);
  }
  .nv-scr-se::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: var(--nv-scr-edge-gradient);
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 0;
  }
  .nv-scr-se > * {
    position: relative;
    z-index: 1;
  }
  .nv-scr-se.disabled {
    opacity: 0.5;
  }
  .nv-scr-se-icon {
    flex: none;
    color: var(--nv-scr-muted);
  }
  .nv-scr-se-field {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--nv-scr-text);
    font-size: 14px;
    font-family: inherit;
  }
  .nv-scr-se-field::placeholder {
    color: var(--nv-scr-faint);
  }
  .nv-scr-se-field:disabled {
    cursor: not-allowed;
  }
  /* strip the native search clear so ours is the only one */
  .nv-scr-se-field::-webkit-search-decoration,
  .nv-scr-se-field::-webkit-search-cancel-button {
    appearance: none;
  }
  .nv-scr-se-clear {
    flex: none;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    color: var(--nv-scr-muted);
    cursor: pointer;
    transition:
      background var(--nv-duration-fast, 150ms) var(--nv-scr-ease),
      color var(--nv-duration-fast, 150ms) var(--nv-scr-ease),
      transform var(--nv-duration-fast, 150ms) var(--nv-scr-ease);
  }
  .nv-scr-se-clear:active {
    transform: scale(0.88);
  }
  .nv-scr-se-clear:hover {
    background: rgba(255, 255, 255, 0.12);
    color: var(--nv-scr-text);
  }

  @media (prefers-reduced-motion: reduce) {
    .nv-scr-se-clear {
      transition: none;
    }
  }
}
</style>
