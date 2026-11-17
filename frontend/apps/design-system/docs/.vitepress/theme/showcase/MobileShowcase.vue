<script setup lang="ts">
import { NvBadge, nvMessage, NvNotifierHost, NvStatusBadge, NvThemeToggle } from '@nerv-iip/ui'
import type {
  ActionItem,
  MobileTabItem,
  PickerOption,
  StepItem,
  SwipeAction,
  TabItem,
} from '@nerv-iip/ui-mobile'
import {
  NvActionSheet,
  NvAppShellMobile,
  NvMobileBadge,
  NvBottomSheet,
  NvCell,
  NvCellGroup,
  NvMobileCollapse,
  NvMobileEmpty,
  NvFab,
  NvInfiniteList,
  NvListRow,
  NvMobileButton,
  NvMobileCheckbox,
  NvMobileDatePicker,
  NvMobileDialog,
  NvMobileGrid,
  NvMobileInput,
  NvMobileRadioGroup,
  NvMobileRadioItem,
  NvMobileSwitch,
  NvMobileTabs,
  NvMobileToast,
  NvNavBar,
  NvNoticeBar,
  NvPicker,
  NvPullRefresh,
  NvMobileResult,
  NvScanBar,
  NvSearchBar,
  NvMobileSteps,
  NvStepper,
  NvSwipeCell,
  NvTabBar,
  NvVirtualList,
} from '@nerv-iip/ui-mobile'
import type { FabAction, GridItem } from '@nerv-iip/ui-mobile'
import {
  BatteryFullIcon,
  BellIcon,
  BoxesIcon,
  ChartColumnIcon,
  ClipboardListIcon,
  PrinterIcon,
  ScanLineIcon,
  SignalHighIcon,
  SplitIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
  WifiIcon,
  WrenchIcon,
  XCircleIcon,
} from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// 页面标题由 VitePress frontmatter 提供（原 definePage 已移除）

// 状态栏时钟（外观框用）
const clock = ref('9:41')
let timer: ReturnType<typeof setInterval> | undefined
function tick() {
  clock.value = new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}
onMounted(() => {
  tick()
  timer = setInterval(tick, 10_000)
})
onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const search = ref('')
const qty = ref(12)
const lockMaterial = ref(true)
const inspect = ref('std')
const sheetOpen = ref(false)
const confirmOpen = ref(false)
const dangerOpen = ref(false)
const scanActive = ref(false)

// 宫格 Grid
const gridItems: GridItem[] = [
  { key: 'wo', icon: ClipboardListIcon, text: '记录', badge: 12 },
  { key: 'scan', icon: ScanLineIcon, text: '扫码' },
  { key: 'mtl', icon: BoxesIcon, text: '清单', badge: true },
  { key: 'report', icon: ChartColumnIcon, text: '提交' },
  { key: 'device', icon: WrenchIcon, text: '资源' },
  { key: 'plan', icon: TruckIcon, text: '计划' },
  { key: 'team', icon: UsersIcon, text: '团队' },
  { key: 'alert', icon: BellIcon, text: '告警', badge: 3 },
]
function onGrid(item: GridItem) {
  nvMessage.info(`打开「${item.text}」`)
}

// NvFab 悬浮按钮
const fabActions: FabAction[] = [
  { key: 'scan', icon: ScanLineIcon, text: '扫码登记' },
  { key: 'wo', icon: ClipboardListIcon, text: '新建记录' },
  { key: 'repair', icon: WrenchIcon, text: '资源报修' },
]
function onFabSelect(action: FabAction) {
  nvMessage.success(`已触发：${action.text}`)
}

// Toast 居中提示
const toastShow = ref(false)
const toastType = ref<'text' | 'loading' | 'success' | 'error'>('text')
const toastMsg = ref('已保存')
function fireToast(type: 'text' | 'success' | 'error', msg: string) {
  toastType.value = type
  toastMsg.value = msg
  toastShow.value = true
}
const loadingToast = ref(false)
function runLoadingToast() {
  loadingToast.value = true
  window.setTimeout(() => {
    loadingToast.value = false
    fireToast('success', '提交成功')
  }, 1600)
}
const scans = ref<string[]>(['BATCH-7782-0034'])

const tabDemo = ref('orders')
const demoTabs: TabItem[] = [
  { value: 'orders', label: '记录', icon: ClipboardListIcon },
  { value: 'scan', label: '扫码', icon: ScanLineIcon },
  { value: 'me', label: '我的', icon: UserIcon },
]

const searchKw = ref('')
const topTab = ref('doing')
const topTabs: MobileTabItem[] = [
  { value: 'all', label: '全部' },
  { value: 'doing', label: '进行中' },
  { value: 'done', label: '已完成' },
  { value: 'blocked', label: '阻塞' },
]
const checkA = ref(true)
const checkB = ref(false)
const procSteps: StepItem[] = [
  { label: '准备' },
  { label: '处理', note: '进行中' },
  { label: '复核' },
  { label: '归档' },
]
const actionOpen = ref(false)
const actions: ActionItem[] = [
  { label: '拆分记录', value: 'split' },
  { label: '补打标签', value: 'reprint' },
  { label: '报告异常', value: 'fault', danger: true },
]
function onAction(value: string) {
  nvMessage.info(`操作：${value}`)
}

const swipeActions: SwipeAction[] = [
  { label: '完工', value: 'finish', tone: 'brand' },
  { label: '暂停', value: 'pause' },
  { label: '删除', value: 'remove', tone: 'danger' },
]
const swipeRows = [
  { code: 'REC-2406-0421', product: '季度回顾草稿' },
  { code: 'REC-2406-0426', product: '设计评审纪要' },
]
function onSwipe(value: string) {
  nvMessage.info(`侧滑操作：${value}`)
}

const pickerOpen = ref(false)
const pickerLine = ref('line-a')
const pickerOptions: PickerOption[] = [
  { label: '分组 A · 精密区', value: 'line-a' },
  { label: '分组 B · 东仓区', value: 'line-b' },
  { label: '分组 C · 西仓区', value: 'line-c' },
  { label: '分组 D · 北区', value: 'line-d' },
  { label: '分组 E · 南区', value: 'line-e' },
]
const pickerLabel = computed(
  () => pickerOptions.find((o) => o.value === pickerLine.value)?.label ?? '请选择',
)

const dateOpen = ref(false)
const dateVal = ref('2026-06-18')

const refreshing = ref(false)
const refreshList = ref([
  '季度回顾草稿 · REC-2406-0421',
  '设计评审纪要 · REC-2406-0426',
  '发布检查清单 · REC-2406-0430',
  '用户访谈记录 · REC-2406-0413',
  '运营周报汇总 · REC-2406-0419',
])
let refreshSeq = 0
function onRefresh() {
  window.setTimeout(() => {
    refreshList.value.unshift(`新到记录 · REC-2406-05${10 + refreshSeq++}`)
    refreshing.value = false
    nvMessage.success('已刷新')
  }, 1200)
}

// 加载更多
const infLoading = ref(false)
const infFinished = ref(false)
const infList = ref(Array.from({ length: 8 }, (_, i) => i + 1))
function onLoadMore() {
  window.setTimeout(() => {
    const next = infList.value.length
    for (let i = 1; i <= 8; i++) infList.value.push(next + i)
    infLoading.value = false
    if (infList.value.length >= 32) infFinished.value = true
  }, 900)
}

// 虚拟滚动：2000 条
const bigList = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  code: `REC-2406-${String(i + 1).padStart(4, '0')}`,
  qty: ((i * 37) % 900) + 100,
}))

function onScan(value: string) {
  scans.value.unshift(value)
  nvMessage.success(`已扫码 ${value}`)
}
function fireMessage(kind: 'success' | 'info' | 'warning' | 'error') {
  const map = {
    success: () => nvMessage.success('提交成功'),
    info: () => nvMessage.info('已同步服务'),
    warning: () => nvMessage.warning('余量接近下限'),
    error: () => nvMessage.error('网络中断'),
  }
  map[kind]()
}
</script>

<template>
  <div class="nv-phone-wrap">
    <div class="nv-phone nv-m">
      <!-- 状态栏（仅大屏预览显示；真机由系统绘制） -->
      <div class="nv-statusbar">
        <span class="font-semibold tabular-nums">{{ clock }}</span>
        <span class="nv-island" aria-hidden="true" />
        <span class="flex items-center gap-1.5">
          <SignalHighIcon class="size-4" aria-hidden="true" />
          <WifiIcon class="size-4" aria-hidden="true" />
          <BatteryFullIcon class="size-5" aria-hidden="true" />
        </span>
      </div>

      <NvAppShellMobile class="nv-m h-auto min-h-0 flex-1">
        <template #header>
          <NvNavBar title="移动控件">
            <template #right><NvThemeToggle /></template>
          </NvNavBar>
        </template>

        <div class="space-y-7 py-4">
          <!-- 按钮 -->
          <section id="m-basic">
            <p class="nv-m-eyebrow">按钮 NvMobileButton</p>
            <div class="space-y-3 px-3">
              <div class="flex flex-wrap items-center gap-2">
                <NvMobileButton variant="primary">主操作</NvMobileButton>
                <NvMobileButton variant="default">次要</NvMobileButton>
                <NvMobileButton variant="outline">描边</NvMobileButton>
                <NvMobileButton variant="text">文字</NvMobileButton>
                <NvMobileButton variant="danger">删除</NvMobileButton>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <NvMobileButton variant="primary" size="sm">小号</NvMobileButton>
                <NvMobileButton variant="primary" size="md">中号</NvMobileButton>
                <NvMobileButton variant="primary" size="lg">大号</NvMobileButton>
              </div>
              <NvMobileButton variant="primary" size="lg" block>整宽主按钮</NvMobileButton>
            </div>
          </section>

          <!-- 单元格 -->
          <section>
            <p class="nv-m-eyebrow">单元格 NvCell</p>
            <div class="px-3">
              <NvCellGroup>
                <NvCell title="记录号" value="REC-2406-0413" />
                <NvCell title="条目" value="发布检查清单" />
                <NvCell
                  title="流程路线"
                  note="3 个步骤"
                  arrow
                  @click="nvMessage.info('查看流程')"
                />
                <NvCell title="加急插入">
                  <template #value><NvMobileSwitch v-model="lockMaterial" /></template>
                </NvCell>
              </NvCellGroup>
            </div>
          </section>

          <!-- 表单 -->
          <section id="m-form">
            <p class="nv-m-eyebrow">表单控件</p>
            <div class="space-y-4 px-3">
              <NvMobileInput v-model="search" placeholder="搜索记录 / 资源">
                <template #leading><ScanLineIcon aria-hidden="true" /></template>
              </NvMobileInput>
              <div
                class="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <span class="text-[15px]">提交数量</span>
                <NvStepper v-model="qty" :min="1" :max="999" />
              </div>
              <div>
                <p class="mb-2 px-1 text-sm text-muted-foreground">复核策略</p>
                <NvMobileRadioGroup v-model="inspect">
                  <NvMobileRadioItem value="std">标准全检</NvMobileRadioItem>
                  <NvMobileRadioItem value="sample">抽样检验</NvMobileRadioItem>
                  <NvMobileRadioItem value="exempt">免检放行</NvMobileRadioItem>
                </NvMobileRadioGroup>
              </div>
            </div>
          </section>

          <!-- 标签与状态 -->
          <section>
            <p class="nv-m-eyebrow">标签与状态</p>
            <div class="flex flex-wrap gap-2 px-3">
              <NvBadge variant="brand">品牌</NvBadge>
              <NvBadge variant="success">已完成</NvBadge>
              <NvBadge variant="warning">待处理</NvBadge>
              <NvStatusBadge value="running" pulse />
              <NvStatusBadge value="blocked" />
            </div>
          </section>

          <!-- 通知条 -->
          <section>
            <p class="nv-m-eyebrow">通知条 NvNoticeBar</p>
            <div class="space-y-2">
              <NvNoticeBar tone="info">今日计划已重排，受影响记录 6 条</NvNoticeBar>
              <NvNoticeBar tone="warning">分组 B 资源不足：设计评审纪要缺口 452 条</NvNoticeBar>
              <NvNoticeBar tone="danger">RES-04 资源报警，请尽快处理</NvNoticeBar>
            </div>
          </section>

          <!-- 列表行 -->
          <section>
            <p class="nv-m-eyebrow">列表行 NvListRow</p>
            <div class="overflow-hidden border-y border-border">
              <NvListRow
                title="季度回顾草稿"
                subtitle="REC-2406-0421 · 320 条"
                @select="nvMessage.info('打开记录')"
              />
              <NvListRow
                title="设计评审纪要"
                subtitle="REC-2406-0426 · 640 条"
                @select="nvMessage.info('打开记录')"
              />
            </div>
          </section>

          <!-- 标签栏 -->
          <section>
            <p class="nv-m-eyebrow">标签栏 NvTabBar</p>
            <div class="mx-3 overflow-hidden rounded-xl border border-border bg-card">
              <NvTabBar v-model="tabDemo" :items="demoTabs" />
            </div>
            <p class="mt-2 px-4 text-sm text-muted-foreground">当前：{{ tabDemo }}</p>
          </section>

          <!-- 反馈 -->
          <section id="m-feedback">
            <p class="nv-m-eyebrow">反馈 Message / 抽屉</p>
            <div class="space-y-3 px-3">
              <div class="flex flex-wrap gap-2">
                <NvMobileButton variant="default" size="sm" @click="fireMessage('success')"
                  >成功</NvMobileButton
                >
                <NvMobileButton variant="default" size="sm" @click="fireMessage('info')"
                  >信息</NvMobileButton
                >
                <NvMobileButton variant="default" size="sm" @click="fireMessage('warning')"
                  >预警</NvMobileButton
                >
                <NvMobileButton variant="default" size="sm" @click="fireMessage('error')"
                  >错误</NvMobileButton
                >
              </div>
              <NvMobileButton variant="primary" size="md" block @click="sheetOpen = true"
                >打开底部抽屉</NvMobileButton
              >
              <div class="flex gap-2">
                <NvMobileButton
                  variant="default"
                  size="md"
                  class="flex-1"
                  @click="confirmOpen = true"
                  >居中确认</NvMobileButton
                >
                <NvMobileButton variant="danger" size="md" class="flex-1" @click="dangerOpen = true"
                  >危险确认</NvMobileButton
                >
              </div>
            </div>
          </section>

          <!-- 宫格 -->
          <section>
            <p class="nv-m-eyebrow">宫格 NvMobileGrid</p>
            <div class="mx-3 overflow-hidden rounded-xl border border-border bg-card">
              <NvMobileGrid :items="gridItems" :columns="4" @select="onGrid" />
            </div>
          </section>

          <!-- 悬浮按钮 -->
          <section>
            <p class="nv-m-eyebrow">悬浮按钮 NvFab</p>
            <div
              class="relative mx-3 h-64 overflow-hidden rounded-xl border border-border bg-background"
            >
              <div class="space-y-2 p-3">
                <div v-for="n in 4" :key="n" class="h-12 rounded-lg bg-card" />
              </div>
              <NvFab :actions="fabActions" @select="onFabSelect" />
            </div>
            <p class="mt-2 px-4 text-xs text-muted-foreground">
              点击展开速拨动作；锚定容器右下角。
            </p>
          </section>

          <!-- 居中提示 -->
          <section>
            <p class="nv-m-eyebrow">居中提示 NvMobileToast</p>
            <div class="grid grid-cols-2 gap-2 px-3">
              <NvMobileButton variant="default" size="md" @click="fireToast('text', '已复制编号')"
                >文字</NvMobileButton
              >
              <NvMobileButton variant="default" size="md" @click="fireToast('success', '提交成功')"
                >成功</NvMobileButton
              >
              <NvMobileButton variant="default" size="md" @click="fireToast('error', '网络异常')"
                >失败</NvMobileButton
              >
              <NvMobileButton variant="default" size="md" @click="runLoadingToast"
                >加载（带遮罩）</NvMobileButton
              >
            </div>
          </section>

          <!-- 结果页 -->
          <section>
            <p class="nv-m-eyebrow">结果页 NvMobileResult</p>
            <div class="mx-3 rounded-xl border border-border bg-card">
              <NvMobileResult
                status="success"
                title="当期产出已同步"
                description="已完成 4,210 条，合格率 99.2%。"
              />
            </div>
          </section>

          <!-- 扫码 -->
          <section>
            <p class="nv-m-eyebrow">扫码 NvScanBar</p>
            <div class="space-y-3 px-3">
              <NvScanBar :active="scanActive" placeholder="对准条码 / 二维码" @scan="onScan" />
              <NvCellGroup>
                <NvCell v-for="(s, i) in scans" :key="`${s}-${i}`" :title="s" note="批次条码" />
              </NvCellGroup>
            </div>
          </section>

          <!-- 搜索栏 -->
          <section>
            <p class="nv-m-eyebrow">搜索栏 NvSearchBar</p>
            <NvSearchBar v-model="searchKw" cancelable placeholder="搜索记录 / 资源 / 分组" />
          </section>

          <!-- 顶部标签 -->
          <section>
            <p class="nv-m-eyebrow">顶部标签 NvMobileTabs</p>
            <NvMobileTabs v-model="topTab" :items="topTabs" />
            <p class="mt-3 px-4 text-sm text-muted-foreground">当前分类：{{ topTab }}</p>
          </section>

          <!-- 步骤条 -->
          <section>
            <p class="nv-m-eyebrow">步骤条 NvMobileSteps</p>
            <div class="px-3">
              <NvMobileSteps :steps="procSteps" :current="1" />
            </div>
          </section>

          <!-- 复选框 -->
          <section>
            <p class="nv-m-eyebrow">复选框 NvMobileCheckbox</p>
            <div class="px-4">
              <NvMobileCheckbox v-model="checkA">复核合格后转批量</NvMobileCheckbox>
              <NvMobileCheckbox v-model="checkB">完成后自动生成归档单</NvMobileCheckbox>
            </div>
          </section>

          <!-- 角标 -->
          <section>
            <p class="nv-m-eyebrow">角标 NvMobileBadge</p>
            <div class="flex items-center gap-7 px-5">
              <NvMobileBadge :count="5">
                <BellIcon class="size-6 text-foreground" aria-hidden="true" />
              </NvMobileBadge>
              <NvMobileBadge :count="128" :max="99">
                <ClipboardListIcon class="size-6 text-foreground" aria-hidden="true" />
              </NvMobileBadge>
              <NvMobileBadge dot>
                <UserIcon class="size-6 text-foreground" aria-hidden="true" />
              </NvMobileBadge>
            </div>
          </section>

          <!-- 动作面板 -->
          <section>
            <p class="nv-m-eyebrow">动作面板 NvActionSheet</p>
            <div class="px-3">
              <NvMobileButton variant="default" size="md" block @click="actionOpen = true">
                打开动作面板
              </NvMobileButton>
            </div>
          </section>

          <!-- 折叠面板 -->
          <section>
            <p class="nv-m-eyebrow">折叠面板 NvMobileCollapse</p>
            <div
              class="mx-3 divide-y divide-border overflow-hidden rounded-xl border border-border"
            >
              <NvMobileCollapse title="参数配置" :open="true">
                采样 2400 rpm · 步进 180 /min · 自动冷却开
              </NvMobileCollapse>
              <NvMobileCollapse title="资源清单">
                主体材料 ×1 · 密封件 ×2 · 附件若干
              </NvMobileCollapse>
              <NvMobileCollapse title="复核记录">
                首条合格（08:12 张伟）· 抽检 2 次无异常
              </NvMobileCollapse>
            </div>
          </section>

          <!-- 侧滑操作 -->
          <section>
            <p class="nv-m-eyebrow">侧滑操作 NvSwipeCell</p>
            <div class="mx-3 overflow-hidden rounded-xl border border-border">
              <NvSwipeCell
                v-for="row in swipeRows"
                :key="row.code"
                :actions="swipeActions"
                class="border-b border-border last:border-0"
                @select="onSwipe"
              >
                <div class="flex min-h-touch items-center gap-3 px-4 py-3">
                  <div class="min-w-0 flex-1">
                    <div class="text-[15px]">{{ row.product }}</div>
                    <div class="text-sm text-muted-foreground">{{ row.code }}</div>
                  </div>
                  <span class="shrink-0 text-xs text-muted-foreground">← 左滑</span>
                </div>
              </NvSwipeCell>
            </div>
          </section>

          <!-- 滚轮选择 -->
          <section>
            <p class="nv-m-eyebrow">滚轮选择 NvPicker</p>
            <div class="px-3">
              <NvCellGroup>
                <NvCell title="目标分组" :value="pickerLabel" arrow @click="pickerOpen = true" />
                <NvCell title="计划日期" :value="dateVal" arrow @click="dateOpen = true" />
              </NvCellGroup>
            </div>
          </section>

          <!-- 下拉刷新 -->
          <section>
            <p class="nv-m-eyebrow">下拉刷新 NvPullRefresh</p>
            <div class="mx-3 overflow-hidden rounded-xl border border-border">
              <NvPullRefresh v-model="refreshing" class="h-56" @refresh="onRefresh">
                <NvCell v-for="(item, i) in refreshList" :key="`${item}-${i}`" :title="item" />
              </NvPullRefresh>
            </div>
            <p class="mt-2 px-4 text-xs text-muted-foreground">
              在列表顶部下拉以刷新（追加新记录）。
            </p>
          </section>

          <!-- 加载更多 -->
          <section>
            <p class="nv-m-eyebrow">加载更多 NvInfiniteList</p>
            <div class="mx-3 overflow-hidden rounded-xl border border-border">
              <NvInfiniteList
                v-model="infLoading"
                :finished="infFinished"
                class="h-56"
                @load="onLoadMore"
              >
                <NvCell
                  v-for="n in infList"
                  :key="n"
                  :title="`记录条目 #${n}`"
                  note="滚动到底自动加载"
                />
              </NvInfiniteList>
            </div>
          </section>

          <!-- 虚拟滚动 -->
          <section>
            <p class="nv-m-eyebrow">虚拟滚动 NvVirtualList</p>
            <p class="mb-2 px-4 text-xs text-muted-foreground">2000 条数据，仅渲染可视区行。</p>
            <div class="mx-3 overflow-hidden rounded-xl border border-border">
              <NvVirtualList :items="bigList" :item-height="56" class="h-64">
                <template #default="{ item }">
                  <div class="flex h-full items-center gap-3 border-b border-border px-4">
                    <span class="font-mono text-sm text-muted-foreground">{{ item.code }}</span>
                    <span class="ml-auto text-sm tabular-nums">{{ item.qty }} 条</span>
                  </div>
                </template>
              </NvVirtualList>
            </div>
          </section>

          <!-- 空状态 -->
          <section>
            <p class="nv-m-eyebrow">空状态 NvMobileEmpty</p>
            <div class="mx-3 rounded-xl border border-border bg-card">
              <NvMobileEmpty description="暂无待处理记录">
                <NvMobileButton variant="primary" size="sm">去领取</NvMobileButton>
              </NvMobileEmpty>
            </div>
          </section>
        </div>
      </NvAppShellMobile>

      <div class="nv-home-indicator" aria-hidden="true" />
    </div>
  </div>

  <NvBottomSheet v-model:open="sheetOpen" title="更多操作">
    <div class="space-y-2 py-1">
      <NvMobileButton
        variant="default"
        size="lg"
        block
        class="justify-start gap-3"
        @click="sheetOpen = false"
      >
        <SplitIcon class="size-5" aria-hidden="true" />拆分记录
      </NvMobileButton>
      <NvMobileButton
        variant="default"
        size="lg"
        block
        class="justify-start gap-3"
        @click="sheetOpen = false"
      >
        <PrinterIcon class="size-5" aria-hidden="true" />补打标签
      </NvMobileButton>
      <NvMobileButton
        variant="default"
        size="lg"
        block
        class="justify-start gap-3"
        @click="sheetOpen = false"
      >
        <WrenchIcon class="size-5" aria-hidden="true" />资源维护
      </NvMobileButton>
      <NvMobileButton
        variant="danger"
        size="lg"
        block
        class="justify-start gap-3"
        @click="sheetOpen = false"
      >
        <XCircleIcon class="size-5" aria-hidden="true" />报告异常
      </NvMobileButton>
    </div>
  </NvBottomSheet>

  <NvActionSheet v-model:open="actionOpen" title="记录操作" :actions="actions" @select="onAction" />

  <NvPicker
    v-model:open="pickerOpen"
    v-model="pickerLine"
    :options="pickerOptions"
    title="选择分组"
  />

  <NvMobileDatePicker v-model:open="dateOpen" v-model="dateVal" title="计划日期" />

  <NvMobileDialog
    v-model:open="confirmOpen"
    title="下发到分组？"
    description="记录 REC-2406-0413 将下发至分组 A 排队，资源即时锁定。"
    confirm-text="下发"
    @confirm="nvMessage.success('已下发到分组 A')"
  />
  <NvMobileDialog
    v-model:open="dangerOpen"
    title="确认作废该记录？"
    description="作废后不可恢复，已占用资源需手动退回。"
    confirm-text="作废"
    confirm-tone="danger"
    @confirm="nvMessage.error('记录已作废')"
  />

  <NvMobileToast v-model:show="toastShow" :type="toastType" :message="toastMsg" />
  <NvMobileToast v-model:show="loadingToast" type="loading" message="提交中…" overlay />

  <NvNotifierHost />
</template>

<style scoped>
.nv-m-eyebrow {
  position: relative;
  margin: 0 0 0.75rem 1rem;
  padding-left: 0.625rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--muted-foreground);
}
.nv-m-eyebrow::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.15rem;
  bottom: 0.15rem;
  width: 2px;
  border-radius: 9999px;
  background: var(--nv-brand);
}

/* ---- Phone frame ----
   Real phone (<sm): full-bleed app, OS draws the status bar.
   Larger screens: a centered device bezel with a mock status bar so the kit
   reads as a native app preview. */
.nv-phone-wrap {
  display: flex;
  justify-content: center;
  min-height: 100dvh;
}
.nv-phone {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100dvh;
  background: var(--background);
  color: var(--foreground);
  overflow: hidden;
}
.nv-statusbar {
  display: none;
}
.nv-home-indicator {
  display: none;
}

@media (min-width: 640px) {
  .nv-phone-wrap {
    align-items: center;
    padding: 2rem 1rem;
    background:
      radial-gradient(
        60% 50% at 50% 0%,
        color-mix(in oklch, var(--nv-brand) 10%, transparent),
        transparent 70%
      ),
      var(--muted);
  }
  .nv-phone {
    width: 390px;
    height: 844px;
    border-radius: 3.25rem;
    border: 11px solid color-mix(in oklch, var(--foreground) 92%, black);
    box-shadow:
      0 1px 0 1px color-mix(in oklch, var(--foreground) 70%, black) inset,
      0 40px 90px -30px rgb(0 0 0 / 0.55);
  }
  .nv-statusbar {
    position: relative;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 52px;
    padding: 0 1.75rem 0 2rem;
    font-size: 0.875rem;
    color: var(--foreground);
  }
  .nv-island {
    position: absolute;
    left: 50%;
    top: 8px;
    transform: translateX(-50%);
    width: 84px;
    height: 26px;
    border-radius: 9999px;
    background: color-mix(in oklch, var(--foreground) 92%, black);
  }
  .nv-home-indicator {
    display: block;
    height: 22px;
    flex-shrink: 0;
  }
  .nv-home-indicator::after {
    content: '';
    display: block;
    width: 134px;
    height: 5px;
    margin: 8px auto 0;
    border-radius: 9999px;
    background: color-mix(in oklch, var(--foreground) 55%, transparent);
  }
}
</style>
