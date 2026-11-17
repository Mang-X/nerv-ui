---
title: NvMobileAvatar 头像
---

<script setup>
import { NvMobileAvatar } from '@nerv-ui/mobile'
import '@nerv-ui/mobile/styles.css'
</script>

# NvMobileAvatar 头像

移动端头像，图片加载中或失败时回退到姓名首字母，支持圆形与方形。

## 示例

<Demo>
  <NvMobileAvatar name="陈明" size="sm" />
  <NvMobileAvatar name="李静" size="md" />
  <NvMobileAvatar name="王强" size="lg" />
  <NvMobileAvatar name="赵敏" size="xl" />
</Demo>

<Demo>
  <NvMobileAvatar name="车间 A" shape="square" size="lg" />
  <NvMobileAvatar fallback="IQC" shape="square" size="lg" />
</Demo>

<Demo>
  <NvMobileAvatar name="张伟" size="lg">
    <template #fallback>伟</template>
  </NvMobileAvatar>
  <NvMobileAvatar
    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%235a7bd5'/%3E%3Ccircle cx='32' cy='24' r='11' fill='white'/%3E%3Cpath d='M12 58c0-12 9-20 20-20s20 8 20 20' fill='white'/%3E%3C/svg%3E"
    alt="示例头像"
    name="示例头像"
    size="lg"
  />
</Demo>

## API

### NvMobileAvatar 属性

| 属性 | 说明 | 类型 | 默认 |
| --- | --- | --- | --- |
| `src` | 图片地址；加载中和失败时显示回退内容 | `string` | — |
| `alt` | 图片替代文字，缺省用 `name` | `string` | — |
| `name` | 姓名，用于生成首字母回退 | `string` | — |
| `fallback` | 直接指定回退文字 | `string` | — |
| `size` | 尺寸 | `sm \| md \| lg \| xl` | `md` |
| `shape` | 形状 | `circle \| square` | `circle` |
| `fallbackDelay` | 显示回退前的等待毫秒数 | `number` | `0` |

### NvMobileAvatar 插槽

| 插槽 | 说明 |
| --- | --- |
| `fallback` | 自定义回退内容 |
