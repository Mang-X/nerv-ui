<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

/**
 * Screen — big-board tabs. A row of labels over a hairline baseline; the active
 * tab glows cyan and a single underline ink slides beneath it (driven by index,
 * so the travel is smooth). Arrow keys move between tabs. Built on the
 * independent `--nv-scr-*` tokens via `v-model`.
 */
type Value = string | number

const model = defineModel<Value>()

const props = withDefaults(
  defineProps<{ items?: { label: string; value: Value }[]; disabled?: boolean }>(),
  {
    disabled: false,
    items: () => [
      { label: '产量趋势', value: 'output' },
      { label: '质量分析', value: 'quality' },
      { label: '能耗监控', value: 'energy' },
      { label: '设备状态', value: 'device' },
    ],
  },
)

if (!props.disabled && model.value === undefined && props.items.length) {
  model.value = props.items[0].value
}

const root = ref<HTMLElement>()
const activeIndex = computed(() => props.items.findIndex((item) => item.value === model.value))

function select(value: Value) {
  if (props.disabled) return
  model.value = value
  root.value
    ?.querySelectorAll<HTMLElement>('[role="tab"]')
    [props.items.findIndex((item) => item.value === value)]?.focus({ preventScroll: true })
}
function move(dir: 1 | -1) {
  if (props.disabled || !props.items.length) return
  const next = (Math.max(0, activeIndex.value) + dir + props.items.length) % props.items.length
  select(props.items[next].value)
}
watch(
  [() => props.items, () => model.value],
  () => {
    const focused = root.value?.contains(document.activeElement)
    nextTick(() => {
      if (focused && !props.disabled)
        root.value
          ?.querySelectorAll<HTMLElement>('[role="tab"]')
          [Math.max(0, activeIndex.value)]?.focus({ preventScroll: true })
    })
  },
  { deep: true },
)
</script>

<template>
  <div ref="root" class="nv-scr-tb" role="tablist" :aria-disabled="disabled || undefined">
    <button
      v-for="(t, i) in items"
      :key="`${typeof t.value}:${t.value}`"
      type="button"
      class="nv-scr-tb-item nv-focusable"
      role="tab"
      :class="{ on: t.value === model }"
      :aria-selected="t.value === model"
      :disabled="disabled"
      :tabindex="!disabled && i === Math.max(0, activeIndex) ? 0 : -1"
      @click="select(t.value)"
      @keydown.right.prevent="move(1)"
      @keydown.left.prevent="move(-1)"
    >
      {{ t.label }}
    </button>
    <span
      v-if="activeIndex >= 0"
      class="nv-scr-tb-ink"
      :style="{
        width: `${100 / Math.max(1, items.length)}%`,
        transform: `translateX(${activeIndex * 100}%)`,
      }"
    />
  </div>
</template>

<style scoped>
@layer nv-components {
  .nv-scr-tb {
    position: relative;
    display: flex;
    border-bottom: 1px solid var(--nv-scr-line);
  }
  .nv-scr-tb-item {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 9px 4px 11px;
    border: 0;
    background: transparent;
    color: var(--nv-scr-muted);
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    transition: color var(--nv-duration-base, 220ms) var(--nv-scr-ease);
  }
  .nv-scr-tb-item:hover:not(.on) {
    color: var(--nv-scr-text-2);
  }
  .nv-scr-tb-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .nv-scr-tb-item.on {
    color: var(--nv-scr-cyan);
    font-weight: 600;
  }
  /* sliding underline ink */
  .nv-scr-tb-ink {
    position: absolute;
    left: 0;
    bottom: -1px;
    height: 2px;
    border-radius: 2px;
    background: var(--nv-scr-cyan);
    box-shadow: 0 0 10px var(--nv-scr-cyan-dim);
    transition:
      transform var(--nv-duration-slow, 320ms) var(--nv-scr-ease-emphasized),
      width var(--nv-duration-slow, 320ms) var(--nv-scr-ease-emphasized);
  }

  @media (prefers-reduced-motion: reduce) {
    .nv-scr-tb-item,
    .nv-scr-tb-ink {
      transition: none;
    }
  }
}
</style>
