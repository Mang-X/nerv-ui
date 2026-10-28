<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
export interface FusionNode {
  id: string
  sx: number
  sy: number
  w: number
  d: number
  h: number
  icon?: Component
  label: string
  caption?: string
  tone: 'cyan' | 'green' | 'amber' | 'indigo'
}
export interface FusionEdge {
  id: string
  source: string
  target: string
  /** Signed perpendicular displacement of the quadratic control point. */
  bend?: number
}
const props = withDefaults(
  defineProps<{
    nodes?: FusionNode[]
    edges?: FusionEdge[]
    cell?: number
  }>(),
  { nodes: () => [], edges: () => [], cell: 34 },
)
const cell = computed(() => props.cell)
const U = 0.866
const V = 0.5
function fx(sx: number, ix: number, iy: number) {
  return sx + (ix - iy) * cell.value * U
}
function fy(sy: number, ix: number, iy: number, iz: number) {
  return sy + (ix + iy) * cell.value * V - iz * cell.value
}
function ptOf(x: number, y: number) {
  return `${x.toFixed(1)},${y.toFixed(1)}`
}

const cubes = computed(() =>
  props.nodes.map((m) => {
    const { sx, sy, w, d, h } = m
    const top = `${ptOf(fx(sx, 0, 0), fy(sy, 0, 0, h))} ${ptOf(fx(sx, w, 0), fy(sy, w, 0, h))} ${ptOf(fx(sx, w, d), fy(sy, w, d, h))} ${ptOf(fx(sx, 0, d), fy(sy, 0, d, h))}`
    const left = `${ptOf(fx(sx, 0, d), fy(sy, 0, d, h))} ${ptOf(fx(sx, 0, d), fy(sy, 0, d, 0))} ${ptOf(fx(sx, w, d), fy(sy, w, d, 0))} ${ptOf(fx(sx, w, d), fy(sy, w, d, h))}`
    const right = `${ptOf(fx(sx, w, 0), fy(sy, w, 0, h))} ${ptOf(fx(sx, w, 0), fy(sy, w, 0, 0))} ${ptOf(fx(sx, w, d), fy(sy, w, d, 0))} ${ptOf(fx(sx, w, d), fy(sy, w, d, h))}`
    const ax = fx(sx, w / 2, d / 2)
    const ay = fy(sy, w / 2, d / 2, h)
    const labelY = fy(sy, w, d, 0) + 20
    const labelX = fx(sx, w / 2, d / 2)
    return {
      id: m.id,
      top,
      left,
      right,
      ax,
      ay,
      labelX,
      labelY,
      icon: m.icon,
      name: m.label,
      en: m.caption,
      tone: m.tone,
    }
  }),
)

const flows = computed(() =>
  props.edges.flatMap((edge) => {
    const a = cubes.value.find((node) => node.id === edge.source)
    const b = cubes.value.find((node) => node.id === edge.target)
    if (!a || !b) return []
    const dx = b.ax - a.ax
    const dy = b.ay - a.ay
    const length = Math.hypot(dx, dy) || 1
    const bend = edge.bend ?? -40
    const x = (a.ax + b.ax) / 2 - (dy / length) * bend
    const y = (a.ay + b.ay) / 2 + (dx / length) * bend
    return [{ id: edge.id, d: `M${a.ax} ${a.ay} Q${x} ${y} ${b.ax} ${b.ay}` }]
  }),
)
</script>
<template>
  <svg
    class="nv-scr-fusion"
    style="pointer-events: none"
    viewBox="0 0 1440 810"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    <!-- 模块间数据流 -->
    <path v-for="f in flows" :key="`r${f.id}`" class="nv-scr-fusion-rail" :d="f.d" />
    <path v-for="f in flows" :key="`f${f.id}`" class="nv-scr-fusion-flux" :d="f.d" />

    <!-- 模块方块 + 图标 + 标签 -->
    <g v-for="c in cubes" :key="c.id" :data-node="c.id" :class="`nv-scr-fusion-${c.tone}`">
      <polygon class="nv-scr-fusion-face-l" :points="c.left" />
      <polygon class="nv-scr-fusion-face-r" :points="c.right" />
      <polygon class="nv-scr-fusion-face-t" :points="c.top" />
      <foreignObject v-if="c.icon" :x="c.ax - 13" :y="c.ay - 13" width="26" height="26">
        <div class="nv-scr-fusion-ico">
          <component aria-hidden="true" :is="c.icon" :size="20" :stroke-width="1.7" />
        </div>
      </foreignObject>
      <text class="nv-scr-fusion-label" :x="c.labelX" :y="c.labelY" text-anchor="middle">
        {{ c.name }}
      </text>
      <text class="nv-scr-fusion-en" :x="c.labelX" :y="c.labelY + 15" text-anchor="middle">
        {{ c.en }}
      </text>
    </g>
  </svg>
</template>

<style scoped>
@layer nv-components {
  .nv-scr-fusion {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
  }
  .nv-scr-fusion * {
    pointer-events: none;
  }
  .nv-scr-fusion-rail {
    fill: none;
    stroke: var(--nv-scr-line-2);
  }
  .nv-scr-fusion-flux {
    fill: none;
    stroke: var(--nv-scr-cyan);
    stroke-dasharray: 5 60;
    animation: nv-scr-fusion-flux 9s linear infinite;
  }
  .nv-scr-fusion-cyan {
    color: var(--nv-scr-cyan);
  }
  .nv-scr-fusion-green {
    color: var(--nv-scr-green);
  }
  .nv-scr-fusion-amber {
    color: var(--nv-scr-amber);
  }
  .nv-scr-fusion-indigo {
    color: var(--nv-scr-indigo);
  }
  .nv-scr-fusion-face-t,
  .nv-scr-fusion-face-l,
  .nv-scr-fusion-face-r {
    stroke: currentColor;
    fill: color-mix(in srgb, currentColor 6%, transparent);
    stroke-opacity: 0.32;
  }
  .nv-scr-fusion-face-l {
    fill-opacity: 0.4;
    stroke-opacity: 0.16;
  }
  .nv-scr-fusion-face-r {
    fill-opacity: 0.7;
    stroke-opacity: 0.2;
  }
  .nv-scr-fusion-ico {
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
  }
  .nv-scr-fusion-label {
    fill: var(--nv-scr-text-2);
    font-size: 18px;
  }
  .nv-scr-fusion-en {
    fill: var(--nv-scr-muted);
    font-size: 12px;
  }
  @keyframes nv-scr-fusion-flux {
    from {
      stroke-dashoffset: 65;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .nv-scr-fusion-flux {
      animation: none;
    }
  }
}
</style>
