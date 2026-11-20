<script setup lang="ts">
import { shallowRef } from 'vue'
import {
  NvScreenPanel,
  NvBorderPanel,
  NvTechFrame,
  NvTitleBar,
  NvScreenHeader,
  NvGlowDivider,
} from '@nerv-ui/ui'

const hall = shallowRef(false)
const guidance = shallowRef(false)
const schedule = shallowRef(false)
const message = shallowRef(false)
const flow = shallowRef(true)
</script>

<template>
  <main class="culture-stage">
    <NvScreenHeader
      title="城市文化空间"
      time="10:24:36"
      date="2026年10月25日 · 星期日"
      line="全城空间"
      screen="城市客厅 01"
    />
    <div class="culture-stage-intro">
      <span>与城市相遇 / Culture & Community</span>
      <label><input v-model="flow" type="checkbox" /> 流光分隔</label>
    </div>
    <NvTitleBar title="让日常，多一处停留" sub="阅读 · 展览 · 交流" />
    <div class="culture-stage-grid">
      <NvScreenPanel
        :title="hall ? '河畔展厅' : '街角书房'"
        accent="cyan"
        class="culture-stage-panel"
        role="region"
        aria-label="书房与展厅内容"
        tabindex="0"
      >
        <template #title-extra
          ><button type="button" :aria-expanded="guidance" @click="guidance = !guidance">
            阅读说明
          </button></template
        >
        <template #extra><button type="button" @click="hall = !hall">切换展厅</button></template>
        <div class="culture-stage-story">
          <span class="culture-stage-kicker">此刻开放</span>
          <h2>{{ hall ? '沿着河岸，读一座城' : '翻开一页，遇见远方' }}</h2>
          <p>
            {{
              hall
                ? '从桥梁、渡口与街巷的旧照片，寻找这座城市生长的轨迹。'
                : '在安静的窗边，为一本书留一点时间。这里的每个座位，都欢迎新的故事。'
            }}
          </p>
          <p v-if="guidance" role="status">自由入座，轻声交谈；离开时请将书放回原处。</p>
          <dl>
            <div>
              <dt>开放时间</dt>
              <dd>09:00 — 20:00</dd>
            </div>
            <div>
              <dt>所在区域</dt>
              <dd>{{ hall ? '河畔公共空间' : '梧桐街区' }}</dd>
            </div>
          </dl>
        </div>
      </NvScreenPanel>
      <NvBorderPanel title="今日相聚" class="culture-stage-agenda">
        <template #title
          ><button type="button" :aria-expanded="schedule" @click="schedule = !schedule">
            查看今日安排
          </button></template
        >
        <div
          class="culture-stage-agenda-content"
          role="region"
          aria-label="今日安排内容"
          tabindex="0"
        >
          <h2>把时间，留给喜欢的事</h2>
          <p>一起阅读，也一起发现身边的美。</p>
          <ol v-if="schedule">
            <li>10:30 · 城市阅读会 · 街角书房</li>
            <li>14:00 · 河岸影像展 · 河畔展厅</li>
            <li>16:00 · 周末分享 · 城市客厅</li>
          </ol>
          <p v-else>点击上方，展开今天的相聚时刻。</p>
        </div>
      </NvBorderPanel>
      <NvTechFrame accent="green" class="culture-stage-frame">
        <div>
          <span class="culture-stage-kicker">给下一位来访者</span>
          <h2>留下，一点温暖</h2>
          <p role="status">
            {{
              message ? '愿你在这里，找到属于自己的片刻。' : '每一次停留，都让空间有了新的意义。'
            }}
          </p>
        </div>
        <button type="button" :aria-pressed="message" @click="message = !message">
          {{ message ? '收起留言' : '点亮留言' }}
        </button>
      </NvTechFrame>
    </div>
    <NvGlowDivider :flow="flow" />
    <footer class="culture-stage-footer">
      <span>城市的每个角落，都有新的相遇。</span><a href="#desktop">回到工作空间 →</a>
    </footer>
  </main>
</template>

<style scoped>
@layer app {
  .culture-stage {
    width: 100%;
    height: 100%;
    padding: 24px 40px 28px;
    display: flex;
    flex-direction: column;
    gap: 28px;
    color: var(--nv-scr-text);
    background: var(--nv-scr-bg);
    font-family: var(--font-sans);
  }
  .culture-stage-intro,
  .culture-stage-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
    color: var(--nv-scr-muted);
  }
  .culture-stage-intro label {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .culture-stage-intro input {
    width: 22px;
    height: 22px;
    accent-color: var(--nv-scr-cyan);
  }
  .culture-stage-grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: 1.15fr 1fr;
    grid-template-rows: minmax(0, 1fr) auto;
    gap: 28px;
  }
  .culture-stage-panel {
    grid-row: span 2;
    min-height: 0;
    overflow: auto;
  }
  .culture-stage-story {
    padding: 40px 24px;
    display: flex;
    flex-direction: column;
    gap: 26px;
  }
  .culture-stage-kicker {
    font-size: 18px;
    letter-spacing: 0.14em;
    color: var(--nv-scr-muted);
  }
  .culture-stage h2 {
    font-size: 32px;
    font-weight: 600;
    margin: 0;
    text-wrap: balance;
  }
  .culture-stage p,
  .culture-stage li {
    font-size: 23px;
    line-height: 1.8;
    color: var(--nv-scr-text-2);
    margin: 0;
  }
  .culture-stage-story dl {
    display: flex;
    gap: 72px;
    margin: 16px 0 0;
    font-size: 21px;
  }
  .culture-stage-story dt {
    color: var(--nv-scr-muted);
    margin-bottom: 12px;
    font-size: 18px;
  }
  .culture-stage-story dd {
    margin: 0;
    font-variant-numeric: tabular-nums;
  }
  .culture-stage-agenda {
    min-height: 0;
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 24px;
    padding: 28px 32px;
  }
  .culture-stage-agenda-content {
    height: 100%;
    overflow: auto;
  }
  .culture-stage-agenda ol {
    margin: 0;
    padding-left: 26px;
  }
  .culture-stage-frame {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    padding: 30px 32px;
  }
  .culture-stage-frame h2 {
    margin: 12px 0;
    font-size: 26px;
  }
  .culture-stage-frame p {
    font-size: 20px;
  }
  .culture-stage button,
  .culture-stage-footer a {
    flex: none;
    cursor: pointer;
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    color: var(--nv-scr-text);
    background: var(--nv-scr-panel-b);
    padding: 10px 16px;
    font-size: 18px;
    text-decoration: none;
  }
  .culture-stage button:hover,
  .culture-stage-footer a:hover {
    border-color: var(--nv-scr-cyan);
  }
  .culture-stage :focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 4px;
  }
}
</style>
