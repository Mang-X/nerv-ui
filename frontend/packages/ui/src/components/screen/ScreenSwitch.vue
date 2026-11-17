<script setup lang="ts">
/**
 * Screen — big-board toggle. Off is a sunken hairline track; on fills cyan with
 * a soft glow and slides the handle across. The press squashes the handle a hair
 * (no bounce). State is carried by both the fill and the handle position — never
 * color alone — and `aria-checked` keeps it honest for assistive tech. Built on
 * the independent `--nv-scr-*` tokens via `v-model` (boolean).
 */
const model = defineModel<boolean>({ default: false })

const props = withDefaults(defineProps<{ disabled?: boolean }>(), { disabled: false })

function toggle() {
  if (props.disabled) return
  model.value = !model.value
}
</script>

<template>
  <button
    type="button"
    class="nv-scr-sw nv-focusable"
    role="switch"
    :class="{ on: model }"
    :aria-checked="model"
    :disabled="disabled"
    @click="toggle"
  >
    <span class="nv-scr-sw-track">
      <span class="nv-scr-sw-handle" />
    </span>
  </button>
</template>

<style scoped>
@layer nv-components {
  .nv-scr-sw {
    display: inline-flex;
    padding: 0;
    border: 0;
    background: none;
    cursor: pointer;
    border-radius: 999px;
  }
  .nv-scr-sw:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .nv-scr-sw-track {
    position: relative;
    display: block;
    width: 46px;
    height: 24px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
    box-shadow:
      inset 0 1px 2px rgba(0, 0, 0, 0.5),
      inset 0 0 0 1px var(--nv-scr-line-2);
    transition:
      background var(--nv-duration-base, 220ms) var(--nv-scr-ease),
      box-shadow var(--nv-duration-base, 220ms) var(--nv-scr-ease);
  }
  .nv-scr-sw-handle {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(180deg, #f4f8fb, #c6d2dc);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.55),
      inset 0 1px 0 rgba(255, 255, 255, 0.7);
    transition: transform var(--nv-duration-base, 220ms) var(--nv-scr-ease);
  }
  .nv-scr-sw.on .nv-scr-sw-track {
    background: var(--nv-scr-accent-fill);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.3),
      inset 0 0 0 1px var(--nv-scr-accent-edge);
  }
  .nv-scr-sw.on .nv-scr-sw-handle {
    transform: translateX(22px);
    background: linear-gradient(180deg, #ffffff, #d8eef4);
  }
  /* press — shrink the handle a hair, no bounce (unified with NvSwitch's scale 0.86) */
  .nv-scr-sw:active:not(:disabled) .nv-scr-sw-handle {
    transform: scale(0.86);
  }
  .nv-scr-sw.on:active:not(:disabled) .nv-scr-sw-handle {
    transform: translateX(22px) scale(0.86);
  }

  @media (prefers-reduced-motion: reduce) {
    .nv-scr-sw-track,
    .nv-scr-sw-handle {
      transition: none;
    }
  }
}
</style>
