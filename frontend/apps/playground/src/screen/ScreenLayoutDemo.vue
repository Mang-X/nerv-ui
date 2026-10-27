<script setup lang="ts">
import { ref } from 'vue'
import { NvScreenLayout } from '@nerv-iip/ui'

const seed = ref('city-gallery')
const time = ref('10:30')
const expanded = ref(false)
const selected = ref(false)

function changeLight() {
  seed.value = seed.value === 'city-gallery' ? 'riverside-gallery' : 'city-gallery'
}
</script>

<template>
  <NvScreenLayout
    class="layout-demo"
    :seed="seed"
    title="城市文化空间"
    :time="time"
    date="周二"
    line="今日开放"
    screen="城市客厅"
  >
    <div class="layout-demo-grid">
      <section class="layout-demo-story" aria-label="展厅介绍">
        <p class="layout-demo-kicker">此刻，走进一座城</p>
        <h2>让每一次停留，都有新的发现</h2>
        <p>从街角书房到河岸展厅，总有一处空间适合慢下来。翻开一本书，看看熟悉街道的新模样。</p>
        <div class="layout-demo-actions">
          <button type="button" :aria-expanded="expanded" @click="expanded = !expanded">
            {{ expanded ? '收起介绍' : '阅读完整介绍' }}
          </button>
          <button type="button" @click="changeLight">换一种光影</button>
          <button type="button" @click="time = time === '10:30' ? '10:31' : '10:30'">
            更新时刻
          </button>
        </div>
        <div v-if="expanded" class="layout-demo-extra" role="status">
          <p>
            河岸展厅保留了这座城市不同年代的照片与声音。沿着展线向前，能看见旧桥、渡口、书店与人们的日常。走累了，也可以在阅读角坐下，慢慢看完一段故事。
          </p>
          <p>
            旧照片里的桥连接着两岸，也连接着来来往往的人。有人清晨从桥上走过，去书店挑一本书；有人傍晚靠着栏杆，看水面映出熟悉的街灯。
          </p>
          <p>
            声音档案收录了街市、码头与河岸的日常。驻足倾听时，那些平凡的问候、脚步与笑声，又把一条街的记忆带回眼前。
          </p>
          <p>
            展线尽头的阅读角留有座位和完整的图文记录。你可以沿着时间慢慢翻阅，也可以从最喜欢的一张照片开始，找到自己的城市故事。
          </p>
        </div>
        <p class="layout-demo-feedback" role="status">
          {{ selected ? '已记下你的心仪空间。' : '欢迎发现身边的好地方。' }}
        </p>
      </section>
      <div class="layout-demo-aside">
        <section class="layout-demo-choice" aria-label="街角书房">
          <p>今日推荐</p>
          <h3>街角书房</h3>
          <p>留一段安静时间，和故事相遇。</p>
          <button type="button" :aria-pressed="selected" @click="selected = !selected">
            {{ selected ? '已加入心愿' : '加入心愿' }}
          </button>
        </section>
        <div class="layout-demo-mini" aria-label="河岸展厅画面">
          <NvScreenLayout seed="city-gallery" title="河岸展厅" time="11:00" date="周二">
            <p class="layout-demo-mini-copy">沿着河岸，读一座城。</p>
          </NvScreenLayout>
        </div>
      </div>
    </div>
  </NvScreenLayout>
</template>

<style scoped>
@layer app {
  .layout-demo-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 640px;
    gap: 42px;
    min-height: 100%;
    padding-top: 76px;
    color: var(--nv-scr-text);
  }
  .layout-demo-story {
    min-width: 0;
    padding: 48px;
    border: 1px solid var(--nv-scr-line-2);
    background: var(--nv-scr-bg-accent);
  }
  .layout-demo-kicker,
  .layout-demo-choice > p:first-child {
    color: var(--nv-scr-cyan);
    letter-spacing: 0.12em;
    font-size: 20px;
  }
  .layout-demo-story h2 {
    margin: 20px 0 32px;
    font-size: 54px;
    line-height: 1.25;
  }
  .layout-demo-story > p:not(.layout-demo-kicker) {
    font-size: 25px;
    line-height: 1.7;
  }
  .layout-demo-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    margin: 42px 0;
  }
  .layout-demo button {
    padding: 16px 24px;
    border: 1px solid var(--nv-scr-cyan);
    border-radius: 8px;
    background: var(--nv-scr-bg-accent);
    color: var(--nv-scr-text);
    font: inherit;
    font-size: 22px;
    cursor: pointer;
  }
  .layout-demo button:focus-visible {
    outline: 3px solid var(--nv-scr-cyan);
    outline-offset: 4px;
  }
  .layout-demo-feedback {
    color: var(--nv-scr-text-2);
  }
  .layout-demo-extra {
    max-width: 640px;
  }
  .layout-demo-extra p {
    font-size: 25px;
    line-height: 1.7;
  }
  .layout-demo-aside {
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .layout-demo-choice {
    padding: 36px;
    border: 1px solid var(--nv-scr-line-2);
    background: var(--nv-scr-bg-accent);
  }
  .layout-demo-choice h3 {
    margin: 14px 0;
    font-size: 36px;
  }
  .layout-demo-choice p {
    font-size: 22px;
  }
  .layout-demo-mini {
    position: relative;
    width: 614px;
    height: 346px;
    overflow: hidden;
    border: 1px solid var(--nv-scr-line-2);
  }
  .layout-demo-mini :deep(.nv-scr-layout) {
    transform: scale(0.32);
    transform-origin: top left;
  }
  .layout-demo-mini-copy {
    margin: 120px 0;
    color: var(--nv-scr-text);
    font-size: 56px;
  }
}
</style>
