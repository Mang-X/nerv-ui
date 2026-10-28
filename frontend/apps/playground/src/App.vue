<script setup lang="ts">
import LoginDemo from './login/LoginDemo.vue'
import ScreenParameterDetailDemo from './screen/ScreenParameterDetailDemo.vue'
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import LineAnnotationsDemo from './LineAnnotationsDemo.vue'
import DirectoryDemo from './directory-detail/DirectoryDemo.vue'
import ScreenDemo from './ScreenDemo.vue'
import FilesDemo from './FilesDemo.vue'
import ResourceScheduleDemo from './ResourceScheduleDemo.vue'
import RealGanttDemo from './RealGanttDemo.vue'
import OrderEditingDemo from './OrderEditingDemo.vue'
import ResourceEditingDemo from './ResourceEditingDemo.vue'
import ScheduleDemo from './ScheduleDemo.vue'
import DraftEditingDemo from './DraftEditingDemo.vue'
import SnapshotRiskDemo from './SnapshotRiskDemo.vue'
import ScheduleComparisonDemo from './ScheduleComparisonDemo.vue'
import AsyncCandidateDemo from './AsyncCandidateDemo.vue'
import RequestFormsDemo from './RequestFormsDemo.vue'
import SchedulePanelsDemo from './SchedulePanelsDemo.vue'
import PrintableDetailDemo from './PrintableDetailDemo.vue'
import DayPrintDemo from './DayPrintDemo.vue'
import ActionSummaryDemo from './ActionSummaryDemo.vue'
import NotificationInboxDemo from './NotificationInboxDemo.vue'
import NeutralShellDemo from './NeutralShellDemo.vue'
import TreeDemo from './TreeDemo.vue'
import EntityMultiPickerDemo from './EntityMultiPickerDemo.vue'
import TouchDemo from './TouchDemo.vue'
import PhotoAttachmentsDemo from './PhotoAttachmentsDemo.vue'
import MobileDemo from './MobileDemo.vue'
import MobileInputDemo from './MobileInputDemo.vue'
import MobileOverlayDemo from './MobileOverlayDemo.vue'
import MobileListDemo from './MobileListDemo.vue'
import MobileTaskListDemo from './mobile-task-list/MobileTaskListDemo.vue'
import MobileFlowDemo from './mobile-flow/MobileFlowDemo.vue'
import MobileFeedbackDemo from './MobileFeedbackDemo.vue'
import {
  NvApp,
  NvAppHeader,
  NvContainer,
  NvPage,
  NvPageHeader,
  NvCard,
  NvCardHeader,
  NvCardTitle,
  NvCardDescription,
  NvCardContent,
  NvButton,
  NvInput,
  NvField,
  NvFieldLabel,
  NvFieldDescription,
  NvDataTable,
  NvDialog,
  NvDialogTrigger,
  NvDialogContent,
  NvDialogHeader,
  NvDialogTitle,
  NvDialogDescription,
  NvDialogFooter,
  useColorMode,
  useTheme,
  type NvDataTableColumn,
} from '@nerv-iip/ui'

const surface = shallowRef(window.location.hash)
function syncSurface() {
  surface.value = window.location.hash
}
onMounted(() => window.addEventListener('hashchange', syncSurface))
onUnmounted(() => window.removeEventListener('hashchange', syncSurface))

interface Project {
  id: string
  name: string
  owner: string
}
const projects = ref<Project[]>([
  { id: 'P-001', name: '晨光书房', owner: '林悦' },
  { id: 'P-002', name: '山间来信', owner: '周宁' },
  { id: 'P-003', name: '城市漫步', owner: '陈曦' },
  { id: 'P-004', name: '流动花园', owner: '林悦' },
  { id: 'P-005', name: '远方计划', owner: '周宁' },
  { id: 'P-006', name: '周末画室', owner: '陈曦' },
])
const columns: NvDataTableColumn<Project>[] = [
  { key: 'id', header: '编号', sortable: true, width: '140px' },
  { key: 'name', header: '项目', sortable: true },
  { key: 'owner', header: '负责人', sortable: true, width: '160px' },
  { key: 'actions', header: '操作', width: '120px', hideable: false },
]
const name = ref('')
const selected = ref<Project>()
const { isDark, toggle } = useColorMode()
const { theme, setTheme } = useTheme()
function addProject() {
  const value = name.value.trim()
  if (!value) return
  projects.value.unshift({
    id: `P-${String(projects.value.length + 1).padStart(3, '0')}`,
    name: value,
    owner: '我',
  })
  name.value = ''
}
</script>

<template>
  <LineAnnotationsDemo
    v-if="surface.startsWith('#line-annotations/')"
    :key="surface"
    :space="surface.includes('/garden') ? 'garden' : 'library'"
  />
  <LoginDemo
    v-else-if="surface.startsWith('#login/')"
    :space="surface.endsWith('/studio') ? 'studio' : 'library'"
  />
  <ScreenParameterDetailDemo
    v-else-if="surface.startsWith('#screen/parameter-detail/')"
    :key="surface"
    :context="surface.endsWith('/studio') ? 'studio' : 'library'"
  />
  <NotificationInboxDemo
    :key="surface"
    v-else-if="surface === '#notifications/library' || surface === '#notifications/studio'"
    :space="surface === '#notifications/library' ? 'library' : 'studio'"
  />
  <NeutralShellDemo
    v-else-if="surface === '#shell/library' || surface === '#shell/studio'"
    :key="surface"
    :space="surface === '#shell/library' ? 'library' : 'studio'"
  />
  <TreeDemo
    v-else-if="surface === '#tree/library' || surface === '#tree/studio'"
    :key="surface"
    :space="surface === '#tree/library' ? 'library' : 'studio'"
  />
  <DirectoryDemo
    v-else-if="surface === '#directory-detail' || surface.startsWith('#directory-detail/')"
  />
  <PrintableDetailDemo v-else-if="surface === '#printable-detail'" />
  <EntityMultiPickerDemo v-else-if="surface === '#entity-multi-picker'" />
  <ActionSummaryDemo v-else-if="surface === '#action-summary'" />
  <DayPrintDemo
    v-else-if="surface === '#schedule-day/library' || surface === '#schedule-day/studio'"
    :key="surface"
    :venue="surface.endsWith('/studio') ? 'studio' : 'library'"
  />
  <RequestFormsDemo
    v-else-if="surface === '#schedule-request/library' || surface === '#schedule-request/studio'"
    :key="surface"
    :venue="surface.endsWith('/studio') ? 'studio' : 'library'"
  />
  <AsyncCandidateDemo
    v-else-if="surface === '#schedule-async/library' || surface === '#schedule-async/studio'"
    :key="surface"
    :venue="surface.endsWith('/studio') ? 'studio' : 'library'"
  />
  <ScheduleComparisonDemo
    v-else-if="surface === '#schedule-compare/library' || surface === '#schedule-compare/studio'"
    :key="surface"
    :venue="surface.endsWith('/studio') ? 'studio' : 'library'"
  />
  <SnapshotRiskDemo
    v-else-if="surface === '#schedule-snapshot/library' || surface === '#schedule-snapshot/studio'"
    :key="surface"
    :venue="surface.endsWith('/studio') ? 'studio' : 'library'"
  />
  <DraftEditingDemo
    v-else-if="surface === '#schedule-draft/library' || surface === '#schedule-draft/studio'"
    :key="surface"
    :venue="surface.endsWith('/studio') ? 'studio' : 'library'"
  />
  <SchedulePanelsDemo
    v-else-if="surface === '#schedule-panels/library' || surface === '#schedule-panels/studio'"
    :key="surface"
    :venue="surface.endsWith('/studio') ? 'studio' : 'library'"
  />
  <ResourceEditingDemo
    v-else-if="
      surface === '#schedule-resource-edit/library' || surface === '#schedule-resource-edit/studio'
    "
    :key="surface"
    :venue="surface.endsWith('/studio') ? 'studio' : 'library'"
  />
  <OrderEditingDemo
    v-else-if="surface === '#schedule-edit/library' || surface === '#schedule-edit/studio'"
    :key="surface"
    :venue="surface.endsWith('/studio') ? 'studio' : 'library'"
  />
  <ResourceScheduleDemo
    v-else-if="
      surface === '#schedule-resources/library' || surface === '#schedule-resources/studio'
    "
    :key="surface"
    :venue="surface.endsWith('/studio') ? 'studio' : 'library'"
  />
  <RealGanttDemo v-else-if="surface === '#schedule-gantt'" />
  <ScheduleDemo v-else-if="surface === '#schedule'" />
  <FilesDemo v-else-if="surface === '#files'" />
  <ScreenDemo v-else-if="surface.startsWith('#screen')" :section="surface" />
  <MobileTaskListDemo
    v-else-if="surface.startsWith('#mobile-task-list')"
    :source="surface.split('/')[1]"
  />
  <PhotoAttachmentsDemo
    v-else-if="surface.startsWith('#mobile-photos')"
    :source="surface.split('/')[1]"
  />
  <MobileFlowDemo v-else-if="surface === '#mobile-flow'" />
  <MobileFeedbackDemo v-else-if="surface === '#mobile-feedback'" />
  <MobileListDemo v-else-if="surface === '#mobile-lists'" />
  <MobileOverlayDemo v-else-if="surface === '#mobile-overlays'" />
  <MobileInputDemo v-else-if="surface === '#mobile-input'" />
  <MobileDemo v-else-if="surface.startsWith('#mobile')" />
  <TouchDemo v-else-if="surface.startsWith('#touch')" />
  <NvApp v-else>
    <NvAppHeader>
      <a href="#directory-detail" class="inline-flex min-h-11 items-center px-4 underline"
        >空间目录</a
      >
      <a href="#notifications/library" class="inline-flex min-h-11 items-center px-4 underline"
        >消息与安排</a
      >
      <a href="#shell/library" class="inline-flex min-h-11 items-center px-4 underline">晨光书房</a>
      <a href="#shell/studio" class="inline-flex min-h-11 items-center px-4 underline">周末画室</a>
      <a href="#line-annotations/library" class="text-sm text-brand">时段标注</a>
      <a href="#tree/library" class="inline-flex min-h-11 items-center px-4 underline">空间分区</a>
      <a href="#login/library">空间登录与改密</a>
      <a href="#entity-multi-picker" class="inline-flex min-h-11 items-center px-4 underline"
        >挑选去处</a
      >
      <a href="#printable-detail" class="underline">生活手记</a>
      <a href="#action-summary" class="inline-flex min-h-11 items-center px-4 underline"
        >今日小事</a
      >
      <a href="#schedule-day/library" class="inline-flex min-h-11 items-center px-4 underline"
        >日安排与打印</a
      >
      <a href="#schedule-request/library" class="inline-flex min-h-11 items-center px-4 underline"
        >项目安排请求</a
      >
      <a href="#schedule-async/library" class="inline-flex min-h-11 items-center px-4 underline"
        >异步候选</a
      >
      <a href="#schedule-compare/library" class="inline-flex min-h-11 items-center px-4 underline"
        >安排对照</a
      >
      <a href="#schedule-snapshot/library" class="inline-flex min-h-11 items-center px-4 underline"
        >安排核对</a
      >
      <a href="#schedule-draft/library" class="inline-flex min-h-11 items-center px-4 underline"
        >一起安排</a
      >
      <a href="#schedule-panels/library" class="inline-flex min-h-11 items-center px-4 underline"
        >活动安排</a
      >
      <a href="#schedule-edit/library" class="inline-flex min-h-11 items-center px-4 underline"
        >安排共读</a
      >
      <a href="#schedule-resources/library" class="inline-flex min-h-11 items-center px-4 underline"
        >空间安排</a
      >
      <a href="#schedule" class="inline-flex min-h-11 items-center px-4 underline">时间安排</a>
      <a href="#files" class="inline-flex min-h-11 items-center px-4 underline">留住片刻</a>
      <a
        href="#screen"
        class="inline-flex min-h-11 items-center rounded-lg px-3 text-sm underline focus-visible:outline-2"
        >大屏演示</a
      >
      <a href="#mobile-task-list/library" class="inline-flex min-h-touch items-center">收藏翻阅</a>
      <a href="#mobile-flow" class="inline-flex min-h-touch items-center">安排流程</a>
      <a
        href="#mobile-feedback"
        class="inline-flex min-h-11 items-center rounded-lg px-3 text-sm underline focus-visible:outline-2"
        >片刻回响</a
      >
      <a
        href="#mobile-lists"
        class="inline-flex min-h-11 items-center rounded-lg px-3 text-sm underline focus-visible:outline-2"
        >翻阅时光</a
      >
      <a
        href="#mobile"
        class="inline-flex min-h-11 items-center rounded-lg px-3 text-sm underline focus-visible:outline-2"
        >移动演示</a
      >
      <a
        href="#touch"
        class="inline-flex min-h-11 items-center rounded-lg px-3 text-sm underline focus-visible:outline-2"
        >触屏演示</a
      >
      <span class="font-semibold tracking-tight">NvUI</span>
      <span class="text-sm text-muted-foreground">工作空间</span>
      <template #trailing>
        <NvButton
          variant="outline"
          :aria-pressed="theme === 'blue'"
          @click="setTheme(theme === 'blue' ? 'neutral' : 'blue')"
          >蓝色主题</NvButton
        >
        <NvButton variant="outline" :aria-pressed="isDark" @click="toggle">{{
          isDark ? '切换浅色' : '切换深色'
        }}</NvButton>
      </template>
    </NvAppHeader>
    <NvContainer as="main" class="py-6">
      <NvPage>
        <div class="space-y-6">
          <NvPageHeader title="项目清单" :breadcrumbs="[{ label: '工作空间' }]" />
          <div class="space-y-2 pt-2">
            <h1 class="text-2xl font-semibold tracking-tight">让想法有序向前</h1>
            <p class="text-sm text-muted-foreground">记录项目、查找进展，与团队保持同步。</p>
          </div>
          <NvCard>
            <NvCardHeader>
              <NvCardTitle>新建项目</NvCardTitle>
              <NvCardDescription>从一个清晰的名字开始。</NvCardDescription>
            </NvCardHeader>
            <NvCardContent>
              <form class="flex flex-wrap items-start gap-4" @submit.prevent="addProject">
                <NvField class="min-w-64 flex-1">
                  <NvFieldLabel for="project-name">项目名称</NvFieldLabel>
                  <NvInput
                    id="project-name"
                    v-model="name"
                    placeholder="输入项目名称"
                    required
                    maxlength="80"
                  />
                  <NvFieldDescription>最多 80 个字符，创建后可在清单中查找。</NvFieldDescription>
                </NvField>
                <NvButton type="submit" variant="brand" class="mt-6">添加项目</NvButton>
              </form>
            </NvCardContent>
          </NvCard>
          <NvDialog>
            <NvCard>
              <NvCardHeader>
                <NvCardTitle>全部项目</NvCardTitle>
                <NvCardDescription>按名称搜索，点击列头排序。</NvCardDescription>
              </NvCardHeader>
              <NvCardContent>
                <NvDataTable
                  :columns="columns"
                  :rows="projects"
                  row-key="id"
                  :page-size="5"
                  :page-size-options="[5, 10, 20]"
                  search-placeholder="搜索项目…"
                  :column-settings="false"
                >
                  <template #cell-actions="{ row }">
                    <NvDialogTrigger as-child>
                      <NvButton
                        variant="ghost"
                        size="sm"
                        :aria-label="`查看${row.name}`"
                        @click="selected = row"
                        >查看详情</NvButton
                      >
                    </NvDialogTrigger>
                  </template>
                </NvDataTable>
              </NvCardContent>
            </NvCard>
            <NvDialogContent>
              <NvDialogHeader>
                <NvDialogTitle>{{ selected?.name }}</NvDialogTitle>
                <NvDialogDescription>项目详情</NvDialogDescription>
              </NvDialogHeader>
              <dl class="grid grid-cols-2 gap-3 text-sm">
                <dt class="text-muted-foreground">编号</dt>
                <dd>{{ selected?.id }}</dd>
                <dt class="text-muted-foreground">负责人</dt>
                <dd>{{ selected?.owner }}</dd>
              </dl>
              <NvDialogFooter show-close-button />
            </NvDialogContent>
          </NvDialog>
        </div>
      </NvPage>
    </NvContainer>
  </NvApp>
</template>
