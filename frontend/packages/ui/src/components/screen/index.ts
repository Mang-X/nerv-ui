/**
 * Screen — big-board (control-room) component layer. Independent dark
 * "industrial-blue" surface (its own `--nv-scr-*` tokens, no light mode), decoupled
 * from the PC/mobile layers and following only the shared design philosophy.
 * Importing any screen component pulls in the token sheet via this barrel.
 */
import './tokens.css'

// Decorative SVG backgrounds (fixed geometry, no host data dependency)
export { default as NvScreenFlowLinesBg } from './FlowLinesBg.vue'
export { default as NvScreenIsometricBlocksBg } from './IsometricBlocksBg.vue'
export { default as NvScreenLayout } from './ScreenLayout.vue'

// Containers / surfaces
export { default as NvScreenPanel } from './ScreenPanel.vue'
export { default as NvScreenScrollArea } from './ScreenScrollArea.vue'

// Big-board infrastructure（原 apps/screen screen-kit 上提，MAN-321）：
// 舞台缩放 / 无缝自动滚动 / 大屏取数（轮询 + 隐藏暂停 + 失败保活）
export { default as NvScreenScaler } from './ScreenScaler.vue'
export { default as NvScrollBoard } from './ScrollBoard.vue'
export * from './scale'
export * from './useScreenData'

// Indicators & charts
export { default as NvOeeHero } from './OeeHero.vue'
export { default as NvRingGauge } from './RingGauge.vue'
export { default as NvCapsuleBar } from './CapsuleBar.vue'
export { default as NvDigitalFlop } from './DigitalFlop.vue'
export { default as NvSparkline } from './Sparkline.vue'
export { default as NvScreenTrendChart } from './TrendChart.vue'
export { default as NvScreenBarChart } from './ScreenBarChart.vue'
export { default as NvScreenDonut } from './ScreenDonut.vue'
export { default as NvScreenPareto } from './ScreenPareto.vue'
export { default as NvTaktGantt } from './TaktGantt.vue'

// Data & status
export { default as NvScreenStatusCard } from './StatusCard.vue'
export { default as NvScreenFreshness } from './ScreenFreshness.vue'
export { default as NvKpiBar } from './KpiBar.vue'
export { default as NvAlarmTable } from './AlarmTable.vue'

// Decoration / chrome
export { default as NvScreenHeader } from './ScreenHeader.vue'
export { default as NvTechFrame } from './TechFrame.vue'
export { default as NvBorderPanel } from './BorderPanel.vue'
export { default as NvTitleBar } from './TitleBar.vue'
export { default as NvGlowDivider } from './GlowDivider.vue'
export { default as NvScreenStatusLight } from './StatusLight.vue'
export { default as NvScreenStatusHero } from './StatusHero.vue'
export { default as NvScreenStatusTag } from './StatusTag.vue'

// Controls (big-screen)
export { default as NvScreenButton } from './ScreenButton.vue'
export { default as NvScreenTable } from './ScreenTable.vue'
export { default as NvScreenSelect } from './ScreenSelect.vue'
export { default as NvScreenSearch } from './ScreenSearch.vue'
export { default as NvScreenInput } from './ScreenInput.vue'
export { default as NvScreenTabs } from './ScreenTabs.vue'
export { default as NvScreenSegmented } from './ScreenSegmented.vue'
export { default as NvScreenSwitch } from './ScreenSwitch.vue'
export { default as NvScreenPagination } from './ScreenPagination.vue'

// Read-only host-owned quantities along a sequence.
export { default as NvScreenStageFlow } from './StageFlow.vue'
export type { ScreenStage } from './StageFlow.vue'

export { default as NvScreenHeatmap } from './Heatmap.vue'
export type { ScreenHeatmapCell, ScreenHeatmapBand, ScreenHeatmapThreshold } from './Heatmap.vue'

export { default as NvScreenSummaryCard } from './SummaryCard.vue'
export type {
  ScreenSummaryMetric,
  ScreenSummaryTone,
  ScreenSummaryStatus,
  ScreenSummaryItem,
} from './SummaryCard.vue'

export { default as NvScreenFusionBg } from './FusionBg.vue'
export type { FusionNode, FusionEdge } from './FusionBg.vue'
export { default as NvScreenLoginStage } from './ScreenLoginStage.vue'
export { default as NvScreenDetailDialog } from './DetailDialog.vue'
export { default as NvScreenParameter } from './Parameter.vue'
