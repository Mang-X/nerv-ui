<script setup lang="ts">
import { computed, useId } from 'vue'
import ScreenHeader from './ScreenHeader.vue'

// The host owns the seed. Geometry stays deterministic across mounts and instances.
// 曲线：5 锚点正弦缓变 → Catmull-Rom 转三次贝塞尔（C1 连续，线条平滑有美感）
// 光点：粗网格抖动采样（蓝噪声近似 —— 均匀不规则、疏密天然和谐，不聚簇）
function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
function mulberry32(seed: number): () => number {
  let a = seed || 1
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
interface AmbientDot {
  x: number
  y: number
  r: number
  /** 0 = 静止；1–3 = 呼吸错相组 */
  b: number
}
function genBackdrop(seedStr: string): { paths: string[]; dots: AmbientDot[] } {
  const rnd = mulberry32(hashStr(seedStr))
  const paths: string[] = []
  for (let k = 0; k < 2; k++) {
    const baseY = 180 + rnd() * 720
    const amp = 80 + rnd() * 180
    const phase = rnd() * Math.PI * 2
    const freq = 0.8 + rnd() * 0.6
    const pts: [number, number][] = Array.from({ length: 5 }, (_, i) => {
      const x = Math.round(-80 + (2080 * i) / 4)
      const y = Math.round(
        Math.max(70, Math.min(1010, baseY + amp * Math.sin(phase + i * freq) + (rnd() - 0.5) * 70)),
      )
      return [x, y]
    })
    let d = `M ${pts[0][0]} ${pts[0][1]}`
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)]
      const p1 = pts[i]
      const p2 = pts[i + 1]
      const p3 = pts[Math.min(pts.length - 1, i + 2)]
      const c1x = (p1[0] + (p2[0] - p0[0]) / 6).toFixed(0)
      const c1y = (p1[1] + (p2[1] - p0[1]) / 6).toFixed(0)
      const c2x = (p2[0] - (p3[0] - p1[0]) / 6).toFixed(0)
      const c2y = (p2[1] - (p3[1] - p1[1]) / 6).toFixed(0)
      d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`
    }
    paths.push(d)
  }
  const dots: AmbientDot[] = []
  const GX = 7
  const GY = 4
  for (let gx = 0; gx < GX; gx++) {
    for (let gy = 0; gy < GY; gy++) {
      const keep = rnd() <= 0.6
      const jx = rnd()
      const jy = rnd()
      const jr = rnd()
      const jb = rnd()
      if (!keep) continue
      dots.push({
        x: Math.round(((gx + 0.15 + jx * 0.7) * 1920) / GX),
        y: Math.round(((gy + 0.15 + jy * 0.7) * 1080) / GY),
        r: +(1 + jr).toFixed(1),
        b: jb < 0.45 ? 1 + (Math.floor(jb * 6.66) % 3) : 0,
      })
    }
  }
  return { paths, dots }
}

const props = withDefaults(
  defineProps<{
    seed: string
    title?: string
    time?: string
    date?: string
    line?: string
    screen?: string
  }>(),
  {
    title: '',
    time: '',
    date: '',
    line: '',
    screen: '',
  },
)
const backdrop = computed(() => genBackdrop(props.seed))
// Vue's per-component id stays stable when seed changes and differs on sibling mounts.
const ambientId = `nv-scr-layout-${useId().replace(/[^a-zA-Z0-9_-]/g, '-')}`
</script>

<template>
  <div class="nv-scr-layout">
    <!-- 舱底 v3：点阵粒子场（密度自顶向下渐隐）——现代、简洁，替代线网格 -->
    <div class="nv-scr-layout__dots" aria-hidden="true" />
    <!-- 光路 + 星尘：按宿主种子确定性生成；
           曲线 Catmull-Rom 平滑，光点网格抖动采样疏密和谐。reduced-motion 静止 -->
    <svg class="nv-scr-layout__paths" viewBox="0 0 1920 1080" aria-hidden="true">
      <defs>
        <linearGradient :id="`${ambientId}-gradient-a`" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="rgba(120,190,255,0)" />
          <stop offset="0.5" stop-color="rgba(120,190,255,0.16)" />
          <stop offset="1" stop-color="rgba(120,190,255,0)" />
        </linearGradient>
        <linearGradient :id="`${ambientId}-gradient-b`" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="rgba(139,155,230,0)" />
          <stop offset="0.5" stop-color="rgba(139,155,230,0.1)" />
          <stop offset="1" stop-color="rgba(139,155,230,0)" />
        </linearGradient>
      </defs>
      <path
        :id="`${ambientId}-a`"
        class="nv-scr-layout-path"
        :d="backdrop.paths[0]"
        fill="none"
        :stroke="`url(#${ambientId}-gradient-a)`"
        stroke-width="1.2"
      />
      <path
        :id="`${ambientId}-b`"
        class="nv-scr-layout-path"
        :d="backdrop.paths[1]"
        fill="none"
        :stroke="`url(#${ambientId}-gradient-b)`"
        stroke-width="1"
      />
      <circle class="nv-scr-layout-comet" r="2.6" fill="rgb(159 212 255)">
        <animateMotion dur="26s" repeatCount="indefinite">
          <mpath :href="`#${ambientId}-a`" />
        </animateMotion>
      </circle>
      <circle class="nv-scr-layout-comet nv-scr-layout-comet--dim" r="2.2" fill="rgb(170 182 239)">
        <animateMotion dur="34s" begin="-14s" repeatCount="indefinite">
          <mpath :href="`#${ambientId}-b`" />
        </animateMotion>
      </circle>
      <g class="nv-scr-layout-sparks">
        <circle
          v-for="(d, i) in backdrop.dots"
          :key="i"
          :cx="d.x"
          :cy="d.y"
          :r="d.r"
          :class="
            d.b === 0
              ? 'nv-scr-layout-still'
              : d.b === 2
                ? 'nv-scr-layout-s2'
                : d.b === 3
                  ? 'nv-scr-layout-s3'
                  : ''
          "
        />
      </g>
    </svg>
    <div class="nv-scr-layout__chrome">
      <slot name="header">
        <ScreenHeader :title="title" :time="time" :date="date" :line="line" :screen="screen" />
      </slot>
    </div>
    <main class="nv-scr-layout__body">
      <slot />
    </main>
  </div>
</template>

<style scoped>
@layer nv-components {
  .nv-scr-layout {
    width: 1920px;
    height: 1080px;
    box-sizing: border-box;
    padding: 22px 30px 26px;
    display: flex;
    flex-direction: column;
    position: relative;
    isolation: isolate;
    /* 舱底层级由描边、间距与光路提供，底色保持纯色。 */
    background: var(--nv-scr-bg);
  }
  /* 点阵粒子场：1px 光点阵，顶部密亮、向下渐隐（mask 控密度） */
  .nv-scr-layout__dots {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    background: transparent;
    -webkit-mask-image: radial-gradient(
      1300px 760px at 50% 0%,
      rgba(0, 0, 0, 0.85),
      rgba(0, 0, 0, 0.2) 58%,
      rgba(0, 0, 0, 0.08)
    );
    mask-image: radial-gradient(
      1300px 760px at 50% 0%,
      rgba(0, 0, 0, 0.85),
      rgba(0, 0, 0, 0.2) 58%,
      rgba(0, 0, 0, 0.08)
    );
  }
  .nv-scr-layout__paths {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
  }
  .nv-scr-layout__paths .nv-scr-layout-comet {
    filter: drop-shadow(0 0 6px rgba(140, 205, 255, 0.85));
  }
  .nv-scr-layout__paths .nv-scr-layout-comet--dim {
    opacity: 0.7;
    filter: drop-shadow(0 0 5px rgba(150, 165, 235, 0.7));
  }
  .nv-scr-layout__paths .nv-scr-layout-sparks circle {
    fill: rgba(165, 210, 255, 0.5);
    filter: drop-shadow(0 0 4px rgba(140, 205, 255, 0.6));
    animation: nv-scr-layout-spark 4.6s ease-in-out infinite;
  }
  .nv-scr-layout__paths .nv-scr-layout-sparks .nv-scr-layout-still {
    animation: none;
    opacity: 0.55;
  }
  .nv-scr-layout__paths .nv-scr-layout-sparks .nv-scr-layout-s2 {
    animation-delay: 1.5s;
  }
  .nv-scr-layout__paths .nv-scr-layout-sparks .nv-scr-layout-s3 {
    animation-delay: 3.1s;
  }
  @keyframes nv-scr-layout-spark {
    50% {
      opacity: 0.15;
    }
  }
  .nv-scr-layout__chrome,
  .nv-scr-layout__body {
    position: relative;
    z-index: 1;
  }
  .nv-scr-layout__body {
    flex: 1;
    min-height: 0;
    margin-top: 16px;
    overflow: auto;
  }
  @media (prefers-reduced-motion: reduce) {
    .nv-scr-layout__paths .nv-scr-layout-comet {
      display: none;
    }
    .nv-scr-layout__paths .nv-scr-layout-sparks circle {
      animation: none;
    }
  }
}
</style>
