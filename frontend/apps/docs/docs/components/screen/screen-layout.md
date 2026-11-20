---
title: NvScreenLayout 种子氛围布局
---

<script setup>
import { ref } from 'vue'
import { NvScreenButton, NvScreenLayout } from '@nerv-ui/ui'
const visited = ref(false)
</script>

# NvScreenLayout 种子氛围布局

以宿主 `seed` 生成两条光路与星点，再放入页头和内容。独立 playground 的 `/#screen/layout` 提供完整交互与缩放。

## 示例

<ScreenDemo wide>
  <div class="nv-scr-layout-doc-preview">
    <NvScreenLayout seed="city-gallery" title="城市文化空间" time="10:30" date="周二" line="今日开放" screen="城市客厅">
      <section class="nv-scr-layout-doc-content">
        <h2>河岸展厅</h2>
        <p>沿着河岸，读一座城。</p>
        <NvScreenButton type="button" variant="secondary" @click="visited = !visited">{{ visited ? '已加入心愿' : '加入心愿' }}</NvScreenButton>
      </section>
    </NvScreenLayout>
  </div>
</ScreenDemo>

```vue
<NvScreenScaler>
  <NvScreenLayout :seed="spaceId" title="城市文化空间" :time="hostTime">
    <NvScreenButton type="button" @click="openGuide">查看导览</NvScreenButton>
  </NvScreenLayout>
</NvScreenScaler>
```

## API

### NvScreenLayout 属性

| 项        | 类型     | 默认             | 说明                                             |
| --------- | -------- | ---------------- | ------------------------------------------------ |
| `seed`    | `string` | 必填             | 宿主持有的稳定身份；字符串原样参与确定性几何计算 |
| `title`   | `string` | `''`             | 页头标题                                         |
| `time`    | `string` | `''`             | 宿主提供的时钟文字，组件不启动计时器             |
| `date`    | `string` | `''`             | 日期或星期文字                                   |
| `line`    | `string` | `''`             | 区域文字                                         |
| `screen`  | `string` | `''`             | 屏幕名称                                         |

### 插槽

| 插槽      | 说明                 |
| --------- | -------------------- |
| `default` | `main` 中的交互内容  |
| `header`  | 可完全替换默认页头   |

## 设计说明

根元素继承宿主的 class、style 与原生属性。布局固定 1920×1080；内容区可原生滚动。淡色点阵与光路只作氛围，装饰层 `pointer-events: none`；系统低动效设置会停用彗星和星点呼吸。独立 Vue 应用根的 SVG 引用在挂载后各自定位到本实例。外层视口缩放、定位、主题及挂钟更新由宿主负责。

<!-- @include: ../../../../../DESIGN/components/screen-layout.md -->

<style>
.nv-scr-layout-doc-preview { position: relative; width: 100%; height: 530px; overflow: hidden; }
.nv-scr-layout-doc-preview > .nv-scr-layout { transform: scale(.48); transform-origin: top left; }
.nv-scr-layout-doc-content { display: grid; justify-items: start; align-content: start; gap: 24px; padding: 100px; color: var(--nv-scr-text); font-size: 36px; }
.nv-scr-layout-doc-content h2 { margin: 0; font-size: 64px; line-height: 1.2; }
.nv-scr-layout-doc-content p { margin: 0; font-size: 36px; line-height: 1.5; }
.nv-scr-layout-doc-content .nv-scr-btn { padding: 20px 32px; height: auto; font: inherit; }
@media (max-width: 1700px) { .nv-scr-layout-doc-preview { height: 390px; } .nv-scr-layout-doc-preview > .nv-scr-layout { transform: scale(.34); } }
@media (max-width: 700px) { .nv-scr-layout-doc-preview { height: 180px; } .nv-scr-layout-doc-preview > .nv-scr-layout { transform: scale(.15); } }
</style>
