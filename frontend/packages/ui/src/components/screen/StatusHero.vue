<script setup lang="ts">
/** A distant-view status display. The host decides what the status means. */
withDefaults(
  defineProps<{
    label: string
    tone?: 'neutral' | 'cyan' | 'green' | 'amber' | 'red'
    rhythm?: 'still' | 'steady' | 'slow' | 'fast'
  }>(),
  { tone: 'neutral', rhythm: 'still' },
)

defineSlots<{ auxiliary(): unknown }>()
</script>

<template>
  <div
    class="nv-scr-sh"
    :class="[`nv-scr-sh-${tone}`, `nv-scr-sh-${rhythm}`]"
    role="status"
    data-status-hero
  >
    <div class="nv-scr-sh-lamp" aria-hidden="true"><span class="nv-scr-sh-core" /></div>
    <div class="nv-scr-sh-label">{{ label }}</div>
    <div v-if="$slots.auxiliary" class="nv-scr-sh-auxiliary"><slot name="auxiliary" /></div>
  </div>
</template>

<style scoped>
@layer nv-components {
  .nv-scr-sh {
    --nv-scr-sh-color: var(--nv-scr-faint);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    min-width: 0;
    color: var(--nv-scr-text);
  }
  .nv-scr-sh-cyan {
    --nv-scr-sh-color: var(--nv-scr-cyan);
  }
  .nv-scr-sh-green {
    --nv-scr-sh-color: var(--nv-scr-green);
  }
  .nv-scr-sh-amber {
    --nv-scr-sh-color: var(--nv-scr-amber);
  }
  .nv-scr-sh-red {
    --nv-scr-sh-color: var(--nv-scr-red);
  }
  .nv-scr-sh-lamp {
    width: 200px;
    aspect-ratio: 1;
    max-width: 100%;
    flex: none;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--nv-scr-text) 2%, transparent);
  }
  .nv-scr-sh-core {
    width: 158px;
    aspect-ratio: 1;
    max-width: calc(100% - 40px);
    border-radius: 50%;
    background: var(--nv-scr-sh-color);
    box-shadow: 0 0 44px color-mix(in srgb, var(--nv-scr-sh-color) 50%, transparent);
  }
  .nv-scr-sh-red .nv-scr-sh-core {
    box-shadow: 0 0 54px color-mix(in srgb, var(--nv-scr-sh-color) 65%, transparent);
  }
  .nv-scr-sh-steady .nv-scr-sh-core {
    animation: nv-scr-sh-breathe 4s ease-in-out infinite;
  }
  .nv-scr-sh-slow .nv-scr-sh-core {
    animation: nv-scr-sh-breathe 2.4s ease-in-out infinite;
  }
  .nv-scr-sh-fast .nv-scr-sh-core {
    animation: nv-scr-sh-breathe 1.2s ease-in-out infinite;
  }
  .nv-scr-sh-label {
    max-width: 100%;
    overflow-wrap: anywhere;
    text-align: center;
    font-size: 34px;
    line-height: 1.25;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--nv-scr-sh-color);
  }
  .nv-scr-sh-auxiliary {
    max-width: 100%;
    min-width: 0;
    padding: 5px 12px;
    border: 1px dashed var(--nv-scr-line-2);
    border-radius: 6px;
    background: color-mix(in srgb, var(--nv-scr-text) 4.5%, transparent);
    text-align: center;
    color: var(--nv-scr-muted);
    font-size: 16px;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  @keyframes nv-scr-sh-breathe {
    50% {
      opacity: 0.55;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .nv-scr-sh-steady .nv-scr-sh-core,
    .nv-scr-sh-slow .nv-scr-sh-core,
    .nv-scr-sh-fast .nv-scr-sh-core {
      animation: none;
    }
  }
}
</style>
