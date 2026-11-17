---
title: R8 组件验证
---

<script setup>
import { NvLineChart, NvBarChart, NvDonutChart, NvFilePreview } from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const planActual = [
  { day: '周一', plan: 900, actual: 860 },
  { day: '周二', plan: 950, actual: 980 },
  { day: '周三', plan: 1000, actual: 940 },
  { day: '周四', plan: 1000, actual: 1060 },
  { day: '周五', plan: 1100, actual: 1020 },
  { day: '周六', plan: 700, actual: 720 },
]
const lineSeries = [
  { key: 'plan', label: '计划', data: planActual.map((row) => ({ x: row.day, y: row.plan })) },
  { key: 'actual', label: '实际', data: planActual.map((row) => ({ x: row.day, y: row.actual })) },
]

const outputByCenter = [
  { center: 'RES-07', good: 412, scrap: 18 },
  { center: 'RES-02', good: 1200, scrap: 24 },
  { center: 'RES-11', good: 96, scrap: 6 },
  { center: 'RES-04', good: 188, scrap: 12 },
  { center: 'RES-01', good: 2740, scrap: 60 },
]
const barSeries = [
  { key: 'good', label: '合格', data: outputByCenter.map((row) => ({ x: row.center, y: row.good })) },
  { key: 'scrap', label: '不合格', data: outputByCenter.map((row) => ({ x: row.center, y: row.scrap })) },
]

const statusMix = [
  { label: '执行中', value: 38 },
  { label: '已完成', value: 52 },
  { label: '待处理', value: 22 },
  { label: '阻塞', value: 6 },
]

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="#eef4ff"/><circle cx="160" cy="88" r="46" fill="#226dc9"/><text x="160" y="160" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#334155">示例图片</text></svg>`
const imageSrc = 'data:image/svg+xml,' + encodeURIComponent(svg)
</script>

# R8 组件验证

## 折线 / 面积

<Demo block>
  <NvLineChart :data="lineSeries" :height="240" area value-suffix=" 件" aria-label="计划与实际完成数" />
</Demo>

## 柱状

<Demo block>
  <NvBarChart :data="barSeries" :height="240" value-suffix=" 件" aria-label="各资源合格与不合格数" />
</Demo>

## 环形

<div style="width: 420px; max-width: 100%">
  <NvDonutChart :data="statusMix" :height="220" aria-label="条目状态分布" />
</div>

## 窄容器响应式

<div style="width: 320px; max-width: 100%">
  <NvLineChart :data="lineSeries" :height="200" aria-label="窄容器折线" />
</div>

## 文件预览

<div style="display: flex; gap: 16px; flex-wrap: wrap">
  <div style="width: 320px">
    <NvFilePreview :src="imageSrc" file-name="示例图片.svg" content-type="image/svg+xml" :height="200" />
  </div>
  <div style="width: 320px">
    <NvFilePreview src="/r8-file-sample.pdf" file-name="质量证据报告.pdf" content-type="application/pdf" :height="200" />
  </div>
  <div style="width: 320px">
    <NvFilePreview file-name="工艺说明.docx" content-type="application/vnd.openxmlformats-officedocument.wordprocessingml.document" :height="200" />
  </div>
</div>
