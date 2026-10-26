<script setup lang="ts">
import {
  NvButton,
  NvStatusDot,
  NvInput,
  NvSelect,
  NvSelectContent,
  NvSelectItem,
  NvSelectTrigger,
  NvSelectValue,
} from '@nerv-iip/ui'
import {
  CalendarClockIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  LockIcon,
  LockOpenIcon,
  MaximizeIcon,
  RefreshCwIcon,
  Redo2Icon,
  SearchIcon,
  Undo2Icon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@lucide/vue'
import { computed } from 'vue'
import type { TimeScale } from '../../engine/engine'
import type { LaneOrder, SchedulingDimension } from '../../model/types'

const props = withDefaults(
  defineProps<{
    scale: TimeScale
    readOnly: boolean
    canUndo: boolean
    canRedo: boolean
    dirty: boolean
    busy: boolean
    canRepreview?: boolean
    canRelease?: boolean
    /**
     * 是否显示编辑簇(撤销 / 重做 / 只读锁)。只读面(如方案「甘特图」页签)传 false:
     * 那里本来就改不了东西,摆一个「允许编辑」的锁按钮是在骗人——点了也不会变成可拖拽。
     */
    canEdit?: boolean
    /** 是否显示搜索框。待排池 500 行、甘特 431 道工序,没有搜索调度员就回 Excel。 */
    searchable?: boolean
    search?: string
    /** 命中总数与当前命中序号(1 基;0 表示尚未定位)。 */
    matchCount?: number
    matchIndex?: number
    searchPlaceholder?: string
    groupDimensions?: SchedulingDimension[]
    groupBy?: string
    laneOrder?: LaneOrder
    /** A reason disables the named action. All authority remains with the host. */
    disabledReasons?: Partial<
      Record<
        | 'scale'
        | 'group'
        | 'laneOrder'
        | 'zoomIn'
        | 'zoomOut'
        | 'today'
        | 'fit'
        | 'undo'
        | 'redo'
        | 'toggleReadOnly'
        | 'repreview'
        | 'release',
        string
      >
    >
    labels?: { repreview?: string; release?: string; dirty?: string }
  }>(),
  {
    canRepreview: true,
    canRelease: true,
    canEdit: true,
    searchable: false,
    search: '',
    matchCount: 0,
    matchIndex: 0,
    searchPlaceholder: '搜工单 / 工序 / 资源',
    groupDimensions: () => [],
    groupBy: 'workCenter',
    laneOrder: 'busiest',
  },
)

const emit = defineEmits<{
  scaleChange: [scale: TimeScale]
  zoomIn: []
  zoomOut: []
  today: []
  fit: []
  undo: []
  redo: []
  repreview: []
  release: []
  toggleReadOnly: []
  'update:search': [value: string]
  searchPrev: []
  searchNext: []
  groupChange: [groupBy: string]
  laneOrderChange: [laneOrder: LaneOrder]
}>()

const scaleModel = computed({
  get: () => props.scale,
  set: (v) => emit('scaleChange', v as TimeScale),
})

const searchModel = computed({
  get: () => props.search,
  set: (v) => emit('update:search', v),
})

const groupModel = computed({
  get: () => props.groupBy,
  set: (value) => emit('groupChange', value),
})

const laneOrderModel = computed({
  get: () => props.laneOrder,
  set: (value) => emit('laneOrderChange', value as LaneOrder),
})

const hasQuery = computed(() => props.search.trim().length > 0)
/** 搜索读数:有输入才说话,且「没找到」必须说出来——静默 0 结果会让人以为搜索坏了。 */
const searchStatus = computed(() => {
  if (!hasQuery.value) return ''
  if (!props.matchCount) return '无匹配'
  return `${props.matchIndex}/${props.matchCount}`
})
type Action = keyof NonNullable<typeof props.disabledReasons>
function reason(action: Action): string | undefined {
  if (props.disabledReasons?.[action]) return props.disabledReasons[action]
  if (['undo', 'redo', 'repreview', 'release'].includes(action)) {
    if (props.readOnly) return '当前为只读'
    if (props.busy) return '正在处理，请稍候'
  }
  if (action === 'toggleReadOnly' && props.busy) return '正在处理，请稍候'
  if (action === 'undo' && !props.canUndo) return '没有可撤销的调整'
  if (action === 'redo' && !props.canRedo) return '没有可重做的调整'
  if (action === 'repreview' && !props.dirty) return '没有未应用的调整'
}
function navigateSearch(direction: 'searchNext' | 'searchPrev') {
  if (hasQuery.value && props.matchCount > 0) {
    if (direction === 'searchNext') emit('searchNext')
    else emit('searchPrev')
  }
}
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-2 border-b border-border/60 bg-card/80 px-5 py-3 backdrop-blur-sm"
  >
    <NvSelect v-model="scaleModel" :disabled="!!reason('scale')">
      <NvSelectTrigger
        class="h-8 w-24 border-border/70"
        aria-label="时间刻度"
        :title="reason('scale')"
        ><NvSelectValue
      /></NvSelectTrigger>
      <NvSelectContent>
        <NvSelectItem value="auto">自适应</NvSelectItem>
        <NvSelectItem value="hour">小时</NvSelectItem>
        <NvSelectItem value="day">日</NvSelectItem>
        <NvSelectItem value="week">周</NvSelectItem>
        <NvSelectItem value="month">月</NvSelectItem>
      </NvSelectContent>
    </NvSelect>

    <NvSelect v-if="groupDimensions.length" v-model="groupModel" :disabled="!!reason('group')">
      <NvSelectTrigger
        class="h-8 w-36 border-border/70"
        aria-label="分组维度"
        :title="reason('group')"
        ><NvSelectValue
      /></NvSelectTrigger>
      <NvSelectContent>
        <NvSelectItem
          v-for="dimension in groupDimensions"
          :key="dimension.key"
          :value="dimension.key"
        >
          {{ dimension.label }}
        </NvSelectItem>
      </NvSelectContent>
    </NvSelect>

    <!-- 泳道排序只在有分组维度时才有意义（单一维度下泳道就是资源本身）。 -->
    <NvSelect
      v-if="groupDimensions.length"
      v-model="laneOrderModel"
      :disabled="!!reason('laneOrder')"
    >
      <NvSelectTrigger
        class="h-8 w-32 border-border/70"
        aria-label="泳道排序"
        :title="reason('laneOrder')"
        ><NvSelectValue
      /></NvSelectTrigger>
      <NvSelectContent>
        <NvSelectItem value="busiest">利用率降序</NvSelectItem>
        <NvSelectItem value="name">名称升序</NvSelectItem>
        <NvSelectItem value="onlyScheduled">仅有排程</NvSelectItem>
      </NvSelectContent>
    </NvSelect>

    <span class="mx-1 h-5 w-px bg-border/60" aria-hidden="true" />

    <div class="flex items-center gap-0.5">
      <NvButton
        size="icon"
        variant="ghost"
        class="size-8"
        aria-label="放大"
        @click="emit('zoomIn')"
        :disabled="!!reason('zoomIn')"
        :title="reason('zoomIn')"
        :aria-description="reason('zoomIn')"
        ><ZoomInIcon aria-hidden="true"
      /></NvButton>
      <NvButton
        size="icon"
        variant="ghost"
        class="size-8"
        aria-label="缩小"
        @click="emit('zoomOut')"
        :disabled="!!reason('zoomOut')"
        :title="reason('zoomOut')"
        :aria-description="reason('zoomOut')"
        ><ZoomOutIcon aria-hidden="true"
      /></NvButton>
      <NvButton
        size="icon"
        variant="ghost"
        class="size-8"
        aria-label="定位到当前"
        @click="emit('today')"
        :disabled="!!reason('today')"
        :title="reason('today')"
        :aria-description="reason('today')"
        ><CalendarClockIcon aria-hidden="true"
      /></NvButton>
      <NvButton
        size="icon"
        variant="ghost"
        class="size-8"
        aria-label="适配窗口"
        @click="emit('fit')"
        :disabled="!!reason('fit')"
        :title="reason('fit')"
        :aria-description="reason('fit')"
        ><MaximizeIcon aria-hidden="true"
      /></NvButton>
    </div>

    <template v-if="canEdit">
      <span class="mx-1 h-5 w-px bg-border/60" aria-hidden="true" />

      <div class="flex items-center gap-0.5">
        <NvButton
          size="icon"
          variant="ghost"
          class="size-8"
          aria-label="撤销"
          @click="emit('undo')"
          :disabled="!!reason('undo')"
          :title="reason('undo')"
          :aria-description="reason('undo')"
          ><Undo2Icon aria-hidden="true"
        /></NvButton>
        <NvButton
          size="icon"
          variant="ghost"
          class="size-8"
          aria-label="重做"
          @click="emit('redo')"
          :disabled="!!reason('redo')"
          :title="reason('redo')"
          :aria-description="reason('redo')"
          ><Redo2Icon aria-hidden="true"
        /></NvButton>
        <NvButton
          size="icon"
          variant="ghost"
          class="size-8"
          :aria-label="readOnly ? '允许编辑' : '锁定为只读'"
          @click="emit('toggleReadOnly')"
          :disabled="!!reason('toggleReadOnly')"
          :title="reason('toggleReadOnly')"
          :aria-description="reason('toggleReadOnly')"
        >
          <LockIcon v-if="readOnly" aria-hidden="true" />
          <LockOpenIcon v-else aria-hidden="true" />
        </NvButton>
      </div>
    </template>

    <template v-if="searchable">
      <span class="mx-1 h-5 w-px bg-border/60" aria-hidden="true" />

      <!-- Enter 找下一个 / Shift+Enter 找上一个 / Esc 清空:与浏览器 Ctrl+F 的肌肉记忆一致。 -->
      <div class="flex items-center gap-1">
        <div class="relative">
          <SearchIcon
            class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <!-- 用 type="text" 而不是 "search":Chrome 会给 search 输入框加一个原生清除 ×,
               与我们这个带无障碍名的清除按钮并排出现两个 ×(实测截图可见)。Esc 清空我们自己接了。 -->
          <NvInput
            v-model="searchModel"
            type="text"
            class="h-8 w-56 border-border/70 pr-8 pl-8 text-sm"
            aria-label="搜索工序"
            :placeholder="searchPlaceholder"
            @keydown.enter.exact.prevent="navigateSearch('searchNext')"
            @keydown.enter.shift.prevent="navigateSearch('searchPrev')"
            @keydown.esc.prevent="emit('update:search', '')"
          />
          <NvButton
            v-if="hasQuery"
            size="icon"
            variant="ghost"
            class="absolute top-1/2 right-0.5 size-7 -translate-y-1/2 text-muted-foreground"
            aria-label="清空搜索"
            @click="emit('update:search', '')"
          >
            <XIcon class="size-3.5" aria-hidden="true" />
          </NvButton>
        </div>
        <span
          v-if="searchStatus"
          class="min-w-14 text-sm tabular-nums"
          :class="matchCount ? 'text-muted-foreground' : 'text-warning'"
          role="status"
          >{{ searchStatus }}</span
        >
        <NvButton
          size="icon"
          variant="ghost"
          class="size-8"
          aria-label="上一个匹配"
          :disabled="!hasQuery || !matchCount"
          :title="!hasQuery ? '请先输入搜索内容' : !matchCount ? '无匹配' : undefined"
          @click="navigateSearch('searchPrev')"
        >
          <ChevronUpIcon aria-hidden="true" />
        </NvButton>
        <NvButton
          size="icon"
          variant="ghost"
          class="size-8"
          aria-label="下一个匹配"
          :disabled="!hasQuery || !matchCount"
          :title="!hasQuery ? '请先输入搜索内容' : !matchCount ? '无匹配' : undefined"
          @click="navigateSearch('searchNext')"
        >
          <ChevronDownIcon aria-hidden="true" />
        </NvButton>
      </div>
    </template>

    <div class="ml-auto flex items-center gap-2.5">
      <span v-if="dirty" class="flex items-center gap-1.5 text-sm font-medium text-warning">
        <NvStatusDot tone="warning" size="sm" aria-hidden="true" />
        {{ labels?.dirty ?? '有未应用的调整' }}
      </span>
      <NvButton
        v-if="canRepreview"
        size="sm"
        variant="outline"
        class="border-border/70"
        @click="emit('repreview')"
        :disabled="!!reason('repreview')"
        :title="reason('repreview')"
        :aria-description="reason('repreview')"
      >
        <RefreshCwIcon aria-hidden="true" />
        {{ labels?.repreview ?? '重新排程' }}
      </NvButton>
      <NvButton
        v-if="canRelease"
        size="sm"
        @click="emit('release')"
        :disabled="!!reason('release')"
        :title="reason('release')"
        :aria-description="reason('release')"
      >
        <CheckIcon aria-hidden="true" />
        {{ labels?.release ?? '发布计划' }}
      </NvButton>
    </div>
  </div>
</template>
