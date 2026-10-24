<script setup lang="ts">
import { Check, ChevronDown } from '@lucide/vue'
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

/**
 * Screen — big-board select. A dark trigger that drops a glowing panel of options
 * **teleported to <body>** so it's never clipped by a panel's `overflow:hidden`;
 * the panel is fixed-positioned under the trigger and re-anchors on scroll/resize.
 * The chosen row reads cyan with a check. Keyboard-driven (↑/↓/Enter/Esc), listbox
 * semantics, closes on outside click. Built on the independent `--nv-scr-*` tokens.
 */
type Value = string | number

const model = defineModel<Value>()

const props = withDefaults(
  defineProps<{
    options?: { label: string; value: Value }[]
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    placeholder: '请选择产线',
    disabled: false,
    options: () => [
      { label: '焊接线 A', value: 'line-a' },
      { label: '装配线 B', value: 'line-b' },
      { label: 'CNC 线 C', value: 'line-c' },
      { label: '涂装线 D', value: 'line-d' },
    ],
  },
)

const open = ref(false)
const root = ref<HTMLElement>()
const trigger = ref<HTMLElement>()
const panel = ref<HTMLElement>()
const activeValue = ref<Value>()
const listId = useId()
const active = computed(() =>
  props.options.findIndex((option) => option.value === activeValue.value),
)
const pos = ref({ left: 0, top: 0, width: 0, maxHeight: 264 })
let observer: ResizeObserver | undefined

const selected = computed(() => props.options.find((o) => o.value === model.value))

/** Anchor the teleported panel just under the trigger, in viewport coords. */
function place() {
  const el = trigger.value
  if (!el || !open.value) return
  const r = el.getBoundingClientRect()
  const gap = 6
  const width = Math.min(r.width, Math.max(0, window.innerWidth - gap * 2))
  const below = Math.max(0, window.innerHeight - r.bottom - gap * 2)
  const above = Math.max(0, r.top - gap * 2)
  const naturalHeight = panel.value ? panel.value.scrollHeight + 2 : 264
  const upwards = below < Math.min(264, naturalHeight) && above > below
  const maxHeight = Math.min(264, upwards ? above : below)
  const height = Math.min(
    panel.value?.offsetHeight || panel.value?.scrollHeight || maxHeight,
    maxHeight,
  )
  pos.value = {
    left: Math.max(gap, Math.min(r.left, window.innerWidth - width - gap)),
    top: upwards ? Math.max(gap, r.top - gap - height) : Math.max(gap, r.bottom + gap),
    width,
    maxHeight,
  }
}
function schedulePlace() {
  nextTick(place)
}
function toggle() {
  if (props.disabled) return
  open.value = !open.value
}
function pick(v: Value) {
  if (props.disabled || !props.options.some((option) => option.value === v)) return
  model.value = v
  open.value = false
  trigger.value?.focus({ preventScroll: true })
}
function onKey(e: KeyboardEvent) {
  if (props.disabled) return
  if (e.key === 'Escape' || e.key === 'Tab') {
    open.value = false
    return
  }
  if (!open.value && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
    e.preventDefault()
    toggle()
    return
  }
  if (!open.value) return
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const next =
      e.key === 'ArrowDown'
        ? Math.min(props.options.length - 1, active.value + 1)
        : Math.max(0, active.value - 1)
    activeValue.value = props.options[next]?.value
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    const option = props.options[active.value]
    if (option) pick(option.value)
  }
}
function onDocPointer(e: MouseEvent) {
  const t = e.target as Node
  if (root.value?.contains(t) || panel.value?.contains(t)) return
  open.value = false
}

watch(open, (v) => {
  if (v) {
    nextTick(() => {
      if (!open.value) return
      place()
      if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(schedulePlace)
        if (trigger.value) observer.observe(trigger.value)
        if (panel.value) observer.observe(panel.value)
      }
    })
    activeValue.value = selected.value?.value ?? props.options[0]?.value
    document.addEventListener('pointerdown', onDocPointer, true)
    window.addEventListener('scroll', schedulePlace, true)
    window.addEventListener('resize', schedulePlace)
  } else {
    observer?.disconnect()
    observer = undefined
    document.removeEventListener('pointerdown', onDocPointer, true)
    window.removeEventListener('scroll', schedulePlace, true)
    window.removeEventListener('resize', schedulePlace)
  }
})
watch(
  () => props.options,
  () => {
    if (active.value < 0) activeValue.value = selected.value?.value ?? props.options[0]?.value
    if (open.value) schedulePlace()
  },
  { deep: true },
)
watch(
  () => props.disabled,
  (disabled) => {
    if (disabled) open.value = false
  },
)
onBeforeUnmount(() => {
  open.value = false
  observer?.disconnect()
  document.removeEventListener('pointerdown', onDocPointer, true)
  window.removeEventListener('scroll', schedulePlace, true)
  window.removeEventListener('resize', schedulePlace)
})
</script>

<template>
  <div ref="root" class="nv-scr-sel" :class="{ disabled, open }">
    <button
      ref="trigger"
      type="button"
      class="nv-scr-sel-trigger"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="open ? listId : undefined"
      :aria-activedescendant="open && active >= 0 ? `${listId}-${active}` : undefined"
      :disabled="disabled"
      @click="toggle"
      @keydown="onKey"
    >
      <span class="nv-scr-sel-value" :class="{ placeholder: !selected }">
        {{ selected ? selected.label : placeholder }}
      </span>
      <ChevronDown class="nv-scr-sel-caret" :size="16" aria-hidden="true" />
    </button>

    <Teleport to="body">
      <ul
        v-if="open"
        ref="panel"
        class="nv-scr-sel-panel nv-scr-scroll"
        role="listbox"
        :id="listId"
        :style="{
          left: `${pos.left}px`,
          top: `${pos.top}px`,
          width: `${pos.width}px`,
          maxHeight: `${pos.maxHeight}px`,
        }"
      >
        <li
          v-for="(o, i) in options"
          :key="`${typeof o.value}:${o.value}`"
          :id="`${listId}-${i}`"
          class="nv-scr-sel-opt"
          role="option"
          :class="{ on: o.value === model, active: i === active }"
          :aria-selected="o.value === model"
          @click="pick(o.value)"
          @mousemove="activeValue = o.value"
        >
          <span>{{ o.label }}</span>
          <Check v-if="o.value === model" class="nv-scr-sel-check" :size="15" />
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<style scoped>
@layer nv-components {
  .nv-scr-sel {
    position: relative;
    display: inline-block;
    width: 100%;
  }
  .nv-scr-sel-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    height: 38px;
    padding: 0 12px;
    border-radius: var(--nv-scr-radius);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--nv-scr-line-2);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
    color: var(--nv-scr-text);
    font-size: 14px;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    transition:
      border-color 0.18s var(--nv-scr-ease),
      box-shadow 0.18s var(--nv-scr-ease);
  }
  .nv-scr-sel.open .nv-scr-sel-trigger,
  .nv-scr-sel-trigger:focus-visible {
    outline: none;
    border-color: var(--nv-scr-cyan);
    box-shadow:
      inset 0 1px 2px rgba(0, 0, 0, 0.4),
      0 0 0 3px var(--nv-scr-cyan-dim);
  }
  .nv-scr-sel.disabled {
    opacity: 0.5;
  }
  .nv-scr-sel.disabled .nv-scr-sel-trigger {
    cursor: not-allowed;
  }
  .nv-scr-sel-value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .nv-scr-sel-value.placeholder {
    color: var(--nv-scr-faint);
  }
  .nv-scr-sel-caret {
    flex: none;
    color: var(--nv-scr-muted);
    transition: transform 0.2s var(--nv-scr-ease);
  }
  .nv-scr-sel.open .nv-scr-sel-caret {
    transform: rotate(180deg);
    color: var(--nv-scr-cyan);
  }

  /* teleported to <body> — fixed so no ancestor overflow can clip it */
  .nv-scr-sel-panel {
    position: fixed;
    box-sizing: border-box;
    color-scheme: dark;
    z-index: 1000;
    margin: 0;
    padding: 5px;
    list-style: none;
    max-height: 264px;
    overflow-y: auto;
    border-radius: var(--nv-scr-radius);
    /* glass — translucent dark + blur, white highlight edge, no colored bloom */
    background: rgba(11, 15, 24, 0.72);
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 16px 40px -12px rgba(0, 0, 0, 0.85);
  }
  .nv-scr-sel-opt {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 9px 11px;
    border-radius: calc(var(--nv-scr-radius) - 3px);
    font-size: 14px;
    color: var(--nv-scr-text-2);
    cursor: pointer;
  }
  .nv-scr-sel-opt.active {
    background: rgba(255, 255, 255, 0.05);
    color: var(--nv-scr-text);
  }
  .nv-scr-sel-opt.on {
    color: var(--nv-scr-cyan);
  }
  .nv-scr-sel-opt.on.active {
    background: rgba(0, 229, 255, 0.1);
  }
  .nv-scr-sel-check {
    flex: none;
    color: var(--nv-scr-cyan);
    filter: drop-shadow(0 0 4px var(--nv-scr-cyan-dim));
  }

  @media (prefers-reduced-motion: reduce) {
    .nv-scr-sel-trigger,
    .nv-scr-sel-caret {
      transition: none;
    }
  }
}
</style>
