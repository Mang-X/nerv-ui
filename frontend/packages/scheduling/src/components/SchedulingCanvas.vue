<script setup lang="ts">
import { Skeleton } from '@nerv-iip/ui'
import { CalendarClockIcon } from '@lucide/vue'
import { computed, ref, toRef } from 'vue'
import { hasInvalidModelTime } from '../model/instant-validation'
import { factoryTimeInput } from '../model/factory-time'
import type { TaskDragPayload, TimeScale } from '../engine/engine'
import type { LaneOrder, ScheduleModel } from '../model/types'
import ReadonlyScheduleTimeline from './ReadonlyScheduleTimeline.vue'
import { useEngine } from './useEngine'
import '../styles/scheduling.css'

// 内部工作组件:GanttChart(view=order)与 ResourceSchedulerBoard(view=resource)的共享内核。
const props = withDefaults(
  defineProps<{
    view: 'order' | 'resource'
    model?: ScheduleModel
    scale?: TimeScale
    readOnly?: boolean
    loading?: boolean
    groupBy?: string
    laneOrder?: LaneOrder
    engineKind?: 'auto' | 'dhtmlx'
  }>(),
  { scale: 'auto', readOnly: false, loading: false, engineKind: 'auto' },
)

const emit = defineEmits<{
  taskSelect: [taskId: string]
  taskDragEnd: [payload: TaskDragPayload]
  conflictClick: [taskId: string]
  lockedDragAttempt: [taskId: string]
}>()

const container = ref<HTMLElement>()
const unresolvedFactoryTime = computed(
  () =>
    props.model != null &&
    (!props.model.timezones?.length ||
      props.model.timezones.some((zone) => !factoryTimeInput('2000-01-01T00:00:00Z', zone)) ||
      props.model.tasks.some(
        (t) => !t.timezone || !factoryTimeInput('2000-01-01T00:00:00Z', t.timezone),
      )),
)
const invalidModelTime = computed(() => props.model != null && hasInvalidModelTime(props.model))
const isEmpty = computed(() => props.model != null && props.model.tasks.length === 0)

const { command, engineName, error } = useEngine({
  container,
  model: toRef(props, 'model'),
  view: props.view,
  scale: toRef(props, 'scale'),
  readOnly: toRef(props, 'readOnly'),
  groupBy: toRef(props, 'groupBy'),
  laneOrder: toRef(props, 'laneOrder'),
  engineKind: props.engineKind,
  on: {
    taskSelected: (p) => emit('taskSelect', p.taskId),
    taskDragEnd: (p) => emit('taskDragEnd', p),
    conflictClicked: (p) => emit('conflictClick', p.taskId),
    lockedDragAttempt: (p) => emit('lockedDragAttempt', p.taskId),
  },
})

/** 供父组件(工作台)下发命令,如缩放/定位/选中。 */
defineExpose({ command, engineName })
</script>

<template>
  <div class="relative h-full w-full">
    <div v-if="loading" data-testid="gantt-skeleton" class="flex h-full w-full flex-col gap-2 p-4">
      <Skeleton v-for="i in 6" :key="i" class="h-7 w-full" />
    </div>
    <template v-else>
      <div
        v-if="!unresolvedFactoryTime && !invalidModelTime"
        v-show="(engineName === 'dhtmlx' || engineName === 'loading') && !unresolvedFactoryTime"
        ref="container"
        :data-view="view"
        :data-engine="engineName"
        class="h-full w-full"
      />
      <p v-if="error || invalidModelTime" role="alert" class="p-4 text-sm text-destructive">
        {{
          invalidModelTime
            ? '实际时刻必须包含 Z 或显式偏移，且为有效日期；请由宿主解析后传入。'
            : `排程引擎初始化失败：${error}`
        }}
      </p>
      <!-- 无可用引擎时的优雅占位:容器仍在 DOM 中,引擎一旦可用即可挂载。 -->
      <p v-else-if="unresolvedFactoryTime" role="status" class="p-4 text-sm text-muted-foreground">
        工厂时区尚未解析，保留当前草案；请核对工厂配置后查看时间轴。
      </p>
      <div
        v-else-if="isEmpty"
        data-testid="gantt-empty"
        role="status"
        aria-live="polite"
        class="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-card text-center text-muted-foreground"
      >
        <CalendarClockIcon class="h-8 w-8" aria-hidden="true" />
        <div class="space-y-1">
          <p class="text-sm font-medium">暂无排程任务</p>
          <p class="text-xs">调整筛选条件或生成排程后再查看甘特图。</p>
        </div>
      </div>
      <ReadonlyScheduleTimeline
        v-else-if="engineName === 'unavailable' && readOnly && model"
        :model="model"
        :view="view"
        :scale="scale"
        :group-by="groupBy"
        :lane-order="laneOrder"
        @task-select="emit('taskSelect', $event)"
        @conflict-click="emit('conflictClick', $event)"
      />
      <div
        v-else-if="engineName === 'unavailable'"
        data-testid="engine-unavailable"
        role="status"
        aria-live="polite"
        class="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-card text-center text-muted-foreground"
      >
        <CalendarClockIcon class="h-8 w-8" aria-hidden="true" />
        <div class="space-y-1">
          <p class="text-sm font-medium">排程引擎未加载</p>
          <p class="text-xs">
            编辑不可用；只读模式可查看原生时间轴。模块失败按页面缓存，重新加载页面后重试。
          </p>
        </div>
      </div>
    </template>
  </div>
</template>
