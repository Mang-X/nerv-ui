<script setup lang="ts">
import { NvScreenFlowLinesBg, NvScreenIsometricBlocksBg } from '@nerv-iip/ui'
</script>

<template>
  <main class="background-demo">
    <header>
      <p class="background-demo-kicker">空间光影</p>
      <h1>流线与等距块体</h1>
      <p>流动的光点与安静的立体网格，为空间增添层次。</p>
    </header>
    <div class="background-demo-grid">
      <section class="background-demo-sample" aria-label="流线背景横幅">
        <NvScreenFlowLinesBg />
        <span>流线 · 主干 / 支线 / 光点</span>
      </section>
      <section class="background-demo-sample" aria-label="等距块体背景横幅">
        <NvScreenIsometricBlocksBg />
        <span>等距块体 · 网格 / 六组块体</span>
      </section>
      <section class="background-demo-sample small" aria-label="流线背景短幅">
        <NvScreenFlowLinesBg />
        <span>流线 · 短幅</span>
      </section>
      <section class="background-demo-sample small" aria-label="等距块体背景短幅">
        <NvScreenIsometricBlocksBg />
        <span>等距块体 · 短幅</span>
      </section>
    </div>
  </main>
</template>

<style scoped>
@layer app {
  .background-demo {
    min-height: 100%;
    padding: 52px 64px;
    background: var(--nv-scr-bg);
    color: var(--nv-scr-text);
  }
  .background-demo header {
    margin-bottom: 32px;
  }
  .background-demo-kicker {
    color: var(--nv-scr-cyan);
    font-size: 14px;
    letter-spacing: 0.14em;
  }
  .background-demo h1 {
    margin: 8px 0;
    font-size: 36px;
    font-weight: 600;
  }
  .background-demo header > p:last-child {
    color: var(--nv-scr-muted);
    font-size: 16px;
  }
  .background-demo-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
  }
  .background-demo-sample {
    position: relative;
    min-width: 0;
    height: 410px;
    overflow: hidden;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    background: var(--nv-scr-bg-accent);
  }
  .background-demo-sample.small {
    height: 210px;
  }
  .background-demo-sample span {
    position: absolute;
    z-index: 1;
    left: 24px;
    bottom: 20px;
    color: var(--nv-scr-text-2);
    font-size: 16px;
  }
}
</style>
