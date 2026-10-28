<script setup lang="ts">
import { ref, watch, onBeforeUnmount, useTemplateRef } from 'vue'
const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    brand?: string
    imageSrc: string
    imageWidth: number
    imageHeight: number
    fit?: 'contain' | 'cover'
    glows?: readonly {
      x: number
      y: number
      size: number
      tone?: 'cyan' | 'amber'
      delay?: number
    }[]
    pending?: boolean
    disabled?: boolean
    error?: string
    hud?: readonly [string, string, string, string]
  }>(),
  { fit: 'contain', glows: () => [], hud: () => ['', '', '', ''] },
)
const emit = defineEmits<{ submit: [] }>()
const loaded = ref(false)
const image = useTemplateRef<SVGImageElement>('image')
let alive = true
onBeforeUnmount(() => {
  alive = false
})
function imageState(event: Event, value: boolean) {
  if (
    alive &&
    event.currentTarget === image.value &&
    image.value?.getAttribute('href') === props.imageSrc
  )
    loaded.value = value
}
watch(
  () => props.imageSrc,
  () => {
    loaded.value = false
  },
  { flush: 'sync' },
)
function submit() {
  if (!props.pending && !props.disabled) emit('submit')
}
const particles = [
  { x: 8, y: 22, s: 7, tone: 'cyan', dur: 12, d: 0, dy: -18 },
  { x: 16, y: 78, s: 5, tone: 'indigo', dur: 15, d: 2.4, dy: -14 },
  { x: 24, y: 12, s: 6, tone: 'cyan', dur: 10, d: 4.8, dy: -20 },
  { x: 33, y: 88, s: 8, tone: 'cyan', dur: 13, d: 1.2, dy: -16 },
  { x: 42, y: 30, s: 5, tone: 'indigo', dur: 16, d: 5.6, dy: -12 },
  { x: 50, y: 66, s: 6, tone: 'cyan', dur: 11, d: 3.2, dy: -22 },
  { x: 57, y: 14, s: 7, tone: 'amber', dur: 14, d: 6.4, dy: -15 },
  { x: 63, y: 82, s: 5, tone: 'cyan', dur: 12, d: 0.8, dy: -18 },
  { x: 70, y: 40, s: 6, tone: 'indigo', dur: 15, d: 4.0, dy: -13 },
  { x: 78, y: 70, s: 8, tone: 'cyan', dur: 10, d: 2.0, dy: -20 },
  { x: 85, y: 24, s: 5, tone: 'cyan', dur: 13, d: 5.2, dy: -16 },
  { x: 91, y: 56, s: 6, tone: 'indigo', dur: 16, d: 1.6, dy: -14 },
  { x: 95, y: 86, s: 7, tone: 'cyan', dur: 12, d: 3.8, dy: -19 },
  { x: 74, y: 8, s: 5, tone: 'amber', dur: 14, d: 7.2, dy: -12 },
]
</script>
<template>
  <section class="nv-scr-login" data-slot="nv-screen-login-stage" :aria-label="title">
    <div class="nv-scr-login-art-col" aria-hidden="true">
      <svg
        :key="imageSrc"
        class="nv-scr-login-art"
        :viewBox="`0 0 ${imageWidth} ${imageHeight}`"
        :preserveAspectRatio="fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'"
      >
        <image
          ref="image"
          :href="imageSrc"
          :width="imageWidth"
          :height="imageHeight"
          preserveAspectRatio="none"
          @load="imageState($event, true)"
          @error="imageState($event, false)"
        />
        <template v-if="loaded">
          <circle
            v-for="(g, i) in glows"
            :key="i"
            class="nv-scr-login-glow"
            :class="g.tone === 'amber' ? 'nv-scr-login-amber' : ''"
            :cx="(g.x * imageWidth) / 100"
            :cy="(g.y * imageHeight) / 100"
            :r="g.size / 2"
            :style="{ animationDelay: `${g.delay ?? 0}s` }"
          />
        </template>
      </svg>
    </div>
    <div class="nv-scr-login-fx" aria-hidden="true">
      <span
        v-for="(p, i) in particles"
        :key="i"
        class="nv-scr-login-p"
        :class="`nv-scr-login-${p.tone}`"
        :style="{
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: `${p.s}px`,
          height: `${p.s}px`,
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.d}s`,
          '--dy': `${p.dy}px`,
        }"
      />
      <span class="nv-scr-login-streak nv-scr-login-s1" /><span
        class="nv-scr-login-streak nv-scr-login-s2"
      />
    </div>
    <div
      v-for="(text, i) in hud"
      :key="i"
      class="nv-scr-login-hud font-mono text-xs"
      :class="`nv-scr-login-${['tl', 'tr', 'bl', 'br'][i]}`"
    >
      {{ text }}
    </div>
    <form
      class="nv-scr-login-panel"
      :aria-label="title"
      :aria-busy="pending"
      @submit.prevent="submit"
    >
      <div class="nv-scr-login-brand nv-scr-login-reveal">
        <slot name="brand">{{ brand }}</slot>
      </div>
      <div class="nv-scr-login-head nv-scr-login-reveal">
        <h1 class="text-2xl font-semibold tracking-tight">{{ title }}</h1>
        <p class="text-sm">{{ description }}</p>
      </div>
      <fieldset class="nv-scr-login-fields nv-scr-login-reveal" :disabled="pending || disabled">
        <slot :pending="pending" :disabled="disabled" />
      </fieldset>
      <p v-if="error" class="nv-scr-login-err text-sm" role="alert">{{ error }}</p>
    </form>
  </section>
</template>
<style scoped>
@layer nv-components {
  .nv-scr-login {
    position: relative;
    min-height: 720px;
    display: flex;
    align-items: center;
    /* 与插画底色一致，插画右缘渐隐后无缝延展 */
    background: var(--nv-scr-bg);
    color: var(--nv-scr-text);
    overflow: hidden;
    font-variant-numeric: tabular-nums;
  }

  /* ── 左：插画列（占满剩余宽度，插画内容区始终居中、随列宽自适应缩放） ── */
  .nv-scr-login-art-col {
    position: relative;
    flex: 1 1 auto;
    min-width: 0;
    height: 100%;
    container-type: size;
    pointer-events: none;
  }
  .nv-scr-login-art {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .nv-scr-login-glow {
    animation: glow-breathe 5.6s ease-in-out infinite;
    fill: var(--nv-scr-cyan);
    opacity: 0.12;
  }
  .nv-scr-login-glow.nv-scr-login-amber {
    fill: var(--nv-scr-amber);
  }
  /* ── 全屏氛围层：漂浮粒子 + 极淡流光 ── */
  .nv-scr-login-fx {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;
  }
  .nv-scr-login-p {
    position: absolute;
    translate: -50% -50%;
    border-radius: 50%;
    opacity: 0;
    animation-name: p-float;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }
  .nv-scr-login-p.nv-scr-login-cyan {
    background: color-mix(in srgb, var(--nv-scr-cyan) 12%, transparent);
  }
  .nv-scr-login-p.nv-scr-login-indigo {
    background: color-mix(in srgb, var(--nv-scr-cyan) 12%, transparent);
  }
  .nv-scr-login-p.nv-scr-login-amber {
    background: color-mix(in srgb, var(--nv-scr-cyan) 12%, transparent);
  }
  @keyframes p-float {
    from {
      transform: translateY(6px);
      opacity: 0.08;
    }
    to {
      transform: translateY(var(--dy, -16px));
      opacity: 0.5;
    }
  }
  .nv-scr-login-streak {
    position: absolute;
    width: 150px;
    height: 1px;
    left: -160px;
    background: color-mix(in srgb, var(--nv-scr-cyan) 12%, transparent);
    opacity: 0;
    animation: streak-move linear infinite;
  }
  .nv-scr-login-s1 {
    top: 20%;
    animation-duration: 26s;
    animation-delay: 4s;
  }
  .nv-scr-login-s2 {
    top: 68%;
    animation-duration: 34s;
    animation-delay: 16s;
  }
  @keyframes streak-move {
    0% {
      transform: translateX(0) rotate(-12deg);
      opacity: 0;
    }
    6% {
      opacity: 0.45;
    }
    46% {
      opacity: 0.3;
    }
    60% {
      transform: translateX(115vw) rotate(-12deg);
      opacity: 0;
    }
    100% {
      transform: translateX(115vw) rotate(-12deg);
      opacity: 0;
    }
  }

  /* ── 四角 HUD ── */
  .nv-scr-login-hud {
    position: absolute;
    letter-spacing: 0.08em;
    color: var(--nv-scr-faint);
    display: inline-flex;
    align-items: center;
    gap: 7px;
    z-index: 2;
  }
  .nv-scr-login-hud.nv-scr-login-mono {
    letter-spacing: 0.04em;
  }
  .nv-scr-login-hud.nv-scr-login-tl {
    top: 32px;
    left: 34px;
  }
  .nv-scr-login-hud.nv-scr-login-tr {
    top: 32px;
    right: 34px;
  }
  .nv-scr-login-hud.nv-scr-login-bl {
    bottom: 32px;
    left: 34px;
  }
  .nv-scr-login-hud.nv-scr-login-br {
    bottom: 32px;
    right: 34px;
  }
  .nv-scr-login-live {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--nv-scr-green);
    box-shadow: 0 0 8px var(--nv-scr-green);
    animation: breathe 4.5s ease-in-out infinite;
  }

  /* ── 右：登录面板（置于插画留白区） ── */
  .nv-scr-login-panel {
    position: relative;
    z-index: 2;
    width: min(452px, calc(100vw - 44px));
    margin-left: auto;
    margin-right: clamp(28px, 9vw, 170px);
    padding: 52px 56px 40px;
    border-radius: 16px;
    border: 1px solid var(--nv-scr-line-2);
    background: color-mix(in srgb, var(--nv-scr-cyan) 12%, transparent);
    box-shadow:
      inset 0 1px 0 var(--nv-scr-highlight),
      0 40px 100px -50px color-mix(in srgb, var(--nv-scr-cyan) 12%, transparent);
  }

  .nv-scr-login-brand {
    display: inline-flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 30px;
  }
  .nv-scr-login-logo-mark {
    width: 19px;
    height: 19px;
    border-radius: 5px;
    background: var(--nv-scr-accent-fill);
    box-shadow: var(--nv-scr-glow);
    animation: breathe 4s ease-in-out infinite;
  }
  .nv-scr-login-logo-word {
    font-weight: 600;
    letter-spacing: 0.17em;
    color: var(--nv-scr-text);
  }
  .nv-scr-login-sep {
    color: var(--nv-scr-cyan);
    margin: 0 1px;
  }

  .nv-scr-login-head {
    margin-bottom: 40px;
  }
  .nv-scr-login-head h1 {
    margin: 0;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--nv-scr-text);
    text-wrap: balance;
  }
  .nv-scr-login-head p {
    margin: 12px 0 0;
    color: var(--nv-scr-muted);
  }

  .nv-scr-login-err {
    margin: 18px 0 0;
    padding: 9px 12px;
    border-radius: 8px;
    border: 1px solid color-mix(in srgb, var(--nv-scr-cyan) 12%, transparent);
    background: color-mix(in srgb, var(--nv-scr-cyan) 12%, transparent);
    text-align: center;
    color: var(--nv-scr-red);
  }
  .nv-scr-login-hint {
    margin: 24px 0 0;
    text-align: center;
    color: var(--nv-scr-faint);
  }

  /* ── 动效：克制、慢 ── */
  .nv-scr-login-reveal {
    animation: reveal 0.7s var(--nv-scr-ease-emphasized) both;
    animation-delay: var(--d, 0s);
  }
  @keyframes reveal {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @keyframes breathe {
    0%,
    100% {
      opacity: 0.55;
    }
    50% {
      opacity: 1;
    }
  }
  @keyframes glow-breathe {
    0%,
    100% {
      opacity: 0.1;
    }
    50% {
      opacity: 0.85;
    }
  }
  @keyframes spin-fast {
    to {
      transform: rotate(360deg);
    }
  }

  /* 窄屏：插画压暗作底（脱离布局流、全屏居中），面板居中 */
  @media (max-width: 960px) {
    .nv-scr-login-panel {
      margin-right: auto;
    }
    .nv-scr-login-art-col {
      position: absolute;
      inset: 0;
      opacity: 0.4;
    }
    .nv-scr-login-hud.nv-scr-login-tr,
    .nv-scr-login-hud.nv-scr-login-br {
      display: none;
    }
  }
  @media (max-width: 560px) {
    .nv-scr-login-panel {
      padding: 44px 32px 34px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nv-scr-login-reveal,
    .nv-scr-login-logo-mark,
    .nv-scr-login-live,
    .nv-scr-login-glow,
    .nv-scr-login-spinner,
    .nv-scr-login-p {
      animation: none;
    }
    .nv-scr-login-reveal {
      opacity: 1;
      transform: none;
    }
    .nv-scr-login-glow {
      opacity: 0.3;
    }
    .nv-scr-login-p {
      opacity: 0.15;
    }
    .nv-scr-login-streak {
      animation: none;
      display: none;
    }
  }
  .nv-scr-login-art-col {
    position: absolute;
    inset: 0;
    width: calc(100% - 580px);
  }
  @media (max-width: 960px) {
    .nv-scr-login-art-col {
      width: 100%;
    }
  }
  .nv-scr-login-panel {
    max-height: none;
    overflow-wrap: anywhere;
  }
  .nv-scr-login-fields {
    border: 0;
    padding: 0;
    margin: 0;
    min-width: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .nv-scr-login * {
      transition: none !important;
    }
  }
}
</style>
