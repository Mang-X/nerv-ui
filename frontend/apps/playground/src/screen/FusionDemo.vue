<script setup lang="ts">
import { h, shallowRef } from 'vue'
const BookOpen = {
  render: () =>
    h(
      'svg',
      { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor' },
      [h('path', { d: 'M3 4 L12 6 L21 4 V19 L12 21 L3 19 Z M12 6 V21' })],
    ),
}
const Flower2 = {
  render: () =>
    h(
      'svg',
      { viewBox: '0 0 24 24', width: 20, height: 20, fill: 'none', stroke: 'currentColor' },
      [h('path', { d: 'M12 22 V10 M12 16 Q2 16 3 6 Q12 6 12 16 M12 12 Q22 12 21 2 Q12 2 12 12' })],
    ),
}
import { NvScreenFusionBg } from '@nerv-iip/ui'
import type { FusionNode } from '@nerv-iip/ui'
const empty = shallowRef(false)
const library: FusionNode[] = [
  {
    id: 'read',
    sx: 380,
    sy: 320,
    w: 2,
    d: 2,
    h: 2,
    icon: BookOpen,
    label: '河岸书房 · 阅读与交流',
    caption: '阅读空间',
    tone: 'cyan',
  },
  { id: 'share', sx: 1000, sy: 440, w: 2, d: 2, h: 1.5, label: '分享角', tone: 'indigo' },
]
const garden: FusionNode[] = [
  {
    id: 'seed',
    sx: 380,
    sy: 320,
    w: 2,
    d: 2,
    h: 1.5,
    icon: Flower2,
    label: '城市花园 · 育苗与种植',
    caption: '共享花园',
    tone: 'green',
  },
  { id: 'grow', sx: 1000, sy: 440, w: 2, d: 2, h: 2, label: '种植区', tone: 'amber' },
]
</script>
<template>
  <section class="fusion-demo">
    <h2>相连的空间</h2>
    <button type="button" @click="empty = !empty">{{ empty ? '恢复空间' : '清空空间' }}</button>
    <figure v-for="(nodes, i) in [library, garden]" :key="i">
      <figcaption>
        {{ i === 0 ? '河岸书房：阅读区流向分享角' : '城市花园：育苗区流向种植区' }}
      </figcaption>
      <div class="fusion-demo-stage">
        <NvScreenFusionBg
          :nodes="empty ? [] : nodes"
          :edges="empty ? [] : [{ id: 'flow', source: nodes[0]!.id, target: nodes[1]!.id }]"
        />
      </div>
      <p>{{ empty ? '暂无空间' : nodes.map((node) => node.label).join(' → ') }}</p>
    </figure>
  </section>
</template>
<style scoped>
@layer app {
  .fusion-demo {
    color: var(--nv-scr-text);
  }
  .fusion-demo-stage {
    position: relative;
    height: 320px;
    background: var(--nv-scr-bg);
  }
  .fusion-demo figure {
    margin: 20px 0;
  }
  .fusion-demo p {
    color: var(--nv-scr-text-2);
    overflow-wrap: anywhere;
  }
}
</style>
