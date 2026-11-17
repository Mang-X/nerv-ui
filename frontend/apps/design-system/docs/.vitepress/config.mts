import tailwindcss from '@tailwindcss/vite'
import { defineConfig, postcssIsolateStyles } from 'vitepress'
import wasm from 'vite-plugin-wasm'
import llmstxt from 'vitepress-plugin-llms'
import { repositoryLink } from './repositoryLinks'

// CSS extraction can place scoped SFC layers before the theme's order statement.
// Register the intended order in HTML before any stylesheet, in dev and built pages.
function registerCssLayers(html: string) {
  if (html.includes('<style data-docs-layer-order>')) return html
  return html.replace(
    '<head>',
    '<head><style data-docs-layer-order>@layer theme, nv-tokens, base, components, nv-components;</style>',
  )
}

// 触屏 pad触控侧栏 —— 复用给 /components/touch 与 /components/board（触屏完整示例）。
const touchSidebar = [
  {
    text: '触屏 pad',
    items: [
      { text: '概览', link: '/components/touch/' },
      { text: '触屏完整示例', link: '/components/board' },
    ],
  },
  {
    text: '操作',
    items: [
      { text: 'NvTouchButton 触控按钮', link: '/components/touch/touch-button' },
      { text: 'NvTouchSegmented 分段切换', link: '/components/touch/touch-segmented' },
      { text: 'NvQtyStepper 数量步进', link: '/components/touch/qty-stepper' },
    ],
  },
  {
    text: '信息',
    items: [
      { text: 'NvStatTile 指标块', link: '/components/touch/stat-tile' },
      { text: 'NvStationBar 站点栏', link: '/components/touch/station-bar' },
    ],
  },
]

// NvUI 组件库文档 (VitePress).
// VitePress 1.x keeps its own supported Vite 5 dependency; workspace applications
// use the Vite Plus core override independently.
export default defineConfig({
  title: 'NvUI 组件库',
  description: '多形态 Vue 组件库 · 设计哲学、设计令牌与组件文档',
  lang: 'zh-CN',
  transformHtml: registerCssLayers,
  markdown: {
    config(md) {
      md.core.ruler.after('inline', 'repository-source-links', (state) => {
        for (const token of state.tokens) {
          for (const child of token.children ?? []) {
            if (child.type !== 'link_open') continue
            const href = child.attrGet('href')
            if (href && state.env.path) child.attrSet('href', repositoryLink(href, state.env.path))
          }
        }
      })
    },
  },
  cleanUrls: true,
  appearance: 'dark', // 默认黑主题，与设计方向一致；导航栏仍可切换亮/暗
  lastUpdated: true,

  themeConfig: {
    logo: undefined,
    // 表面（desktop / mobile / pad / screen）作为顶栏一级入口；各表面内部按分类在侧栏列出组件。
    nav: [
      { text: '指南', link: '/guide/introduction', activeMatch: '/guide/' },
      {
        text: '基础',
        activeMatch: '/foundations/',
        items: [
          { text: '设计哲学', link: '/foundations/philosophy' },
          { text: '设计令牌', link: '/foundations/tokens' },
          { text: '色彩与动态色', link: '/foundations/color' },
          { text: '动效', link: '/foundations/motion' },
        ],
      },
      { text: '桌面', link: '/components/desktop/', activeMatch: '/components/desktop' },
      { text: '移动', link: '/components/mobile/', activeMatch: '/components/mobile' },
      { text: '触屏', link: '/components/touch/', activeMatch: '/components/(touch|board)' },
      { text: '大屏', link: '/components/screen/', activeMatch: '/components/screen' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '介绍', link: '/guide/introduction' },
            { text: '四个表面', link: '/guide/surfaces' },
            { text: '组件概览', link: '/components/overview' },
          ],
        },
      ],
      '/foundations/': [
        {
          text: '基础',
          items: [
            { text: '设计哲学', link: '/foundations/philosophy' },
            { text: '设计令牌', link: '/foundations/tokens' },
            { text: '色彩与动态色', link: '/foundations/color' },
            { text: '动效', link: '/foundations/motion' },
          ],
        },
      ],
      // 桌面 PC —— 组件库式：每个组件一页，按分类分组；多组件/组合场景归入「配方 / 场景」。
      '/components/desktop': [
        {
          text: '桌面',
          items: [
            { text: '概览', link: '/components/desktop/' },
            { text: '完整示例', link: '/components/desktop/gallery' },
          ],
        },
        {
          text: '通用',
          items: [
            { text: 'NvButton 按钮', link: '/components/desktop/button' },
            { text: 'Empty 空状态', link: '/components/desktop/empty' },
            { text: 'Avatar 图像与回退', link: '/components/desktop/avatar' },
            { text: 'Popover 结构与焦点', link: '/components/desktop/popover' },
            { text: 'NvSpinner 加载', link: '/components/desktop/spinner' },
            { text: 'NvBadge 徽标', link: '/components/desktop/badge' },
            { text: 'NvCard 卡片', link: '/components/desktop/card' },
            { text: 'NvFilterBar 受控筛选', link: '/components/desktop/filter-bar' },
            { text: 'NvMetricCard 指标卡', link: '/components/desktop/metric' },
            { text: 'NvActionSummary 行动摘要卡', link: '/components/desktop/action-summary' },
          ],
        },
        {
          text: '布局',
          items: [
            { text: 'NvContainer 容器', link: '/components/desktop/container' },
            { text: 'NvPage 页面布局', link: '/components/desktop/page' },
            { text: 'NvPageGrid 卡片网格', link: '/components/desktop/page-grid' },
            { text: 'NvPageColumns 瀑布分栏', link: '/components/desktop/page-columns' },
            { text: 'NvPageSection 内容区块', link: '/components/desktop/page-section' },
          ],
        },
        {
          text: '导航 / 外壳',
          items: [
            { text: 'NvApp 与 NvAppHeader 应用外壳', link: '/components/desktop/app' },
            { text: 'NvNavigationMenu 导航菜单', link: '/components/desktop/navigation-menu' },
            { text: 'Breadcrumb 面包屑', link: '/components/desktop/breadcrumb' },
          ],
        },
        {
          text: '仪表盘 / 外壳',
          items: [
            { text: 'NvSidebar 侧栏', link: '/components/desktop/sidebar' },
            { text: 'NvAppShellInset 应用外壳', link: '/components/desktop/dashboard' },
          ],
        },
        {
          text: '表单',
          items: [
            { text: 'NvInput 输入框', link: '/components/desktop/input' },
            { text: 'NvField 表单字段', link: '/components/desktop/field' },
            { text: 'FileUpload 文件上传', link: '/components/desktop/file-upload' },
            { text: 'NvSelect 选择器', link: '/components/desktop/select' },
            { text: 'NvCombobox / NvSearchSelect 联想与搜索选择', link: '/components/desktop/combobox' },
            {
              text: 'NvEntityPicker / NvCascadePicker 实体选择与级联选择',
              link: '/components/desktop/entity-picker',
            },
            {
              text: 'NvEntityMultiPicker 可搜索多选',
              link: '/components/desktop/entity-multi-picker',
            },
            { text: 'NvNotificationInbox 通知收件箱', link: '/components/desktop/notification-inbox' },
            { text: 'NvTree 层级树', link: '/components/desktop/tree' },
            { text: 'NvCheckbox 复选框', link: '/components/desktop/checkbox' },
            { text: 'NvRadioGroup 单选框', link: '/components/desktop/radio' },
            { text: 'NvSwitch 开关', link: '/components/desktop/switch' },
            { text: 'NvSlider 滑块', link: '/components/desktop/slider' },
            { text: 'NvDatePicker 日期选择器', link: '/components/desktop/date-picker' },
            { text: 'NvTimePicker 时间选择器', link: '/components/desktop/time-picker' },
          ],
        },
        {
          text: '数据展示',
          items: [
            { text: 'NvDataTable 数据表格', link: '/components/desktop/data-table' },
            { text: 'Pagination 基础分页', link: '/components/desktop/pagination' },
            { text: 'NvGroupPanel 可折叠分组面板', link: '/components/desktop/group-panel' },
            { text: 'NvDescriptions 描述列表', link: '/components/desktop/descriptions' },
            { text: 'NvTimeline 时间线', link: '/components/desktop/timeline' },
            { text: 'NvTabs 标签页', link: '/components/desktop/tabs' },
            { text: 'NvCarousel 轮播图', link: '/components/desktop/carousel' },
            { text: 'FilePreview 文件预览', link: '/components/desktop/file-preview' },
            { text: 'NvStatusDot / NvStatusBadge 状态', link: '/components/desktop/status' },
          ],
        },
        {
          text: '反馈',
          items: [
            { text: 'Alert 警告提示', link: '/components/desktop/alert' },
            { text: 'NvDialog 对话框', link: '/components/desktop/dialog' },
            { text: 'NvAlertDialog 警告对话框', link: '/components/desktop/alert-dialog' },
            { text: 'NvSheet 抽屉', link: '/components/desktop/sheet' },
            { text: 'NvDropdownMenu 动作菜单', link: '/components/desktop/dropdown-menu' },
            { text: 'NvPopconfirm 气泡确认', link: '/components/desktop/popconfirm' },
            { text: 'NvTooltip 文字提示', link: '/components/desktop/tooltip' },
            { text: 'NvNotifierHost 消息提醒', link: '/components/desktop/notify' },
            { text: 'NvLoader 加载', link: '/components/desktop/loader' },
            { text: 'NvCommand 命令面板', link: '/components/desktop/command' },
          ],
        },
        {
          text: '图表',
          items: [{ text: 'NvChart 族图表', link: '/components/desktop/chart' }],
        },
        {
          text: '配方 / 场景',
          items: [
            { text: '看板与记录卡', link: '/components/desktop/kanban-record' },
            { text: '空间登录与修改密码', link: '/components/desktop/login-recipe' },
            { text: '目录筛选与只读详情', link: '/components/desktop/directory-detail' },
            { text: '中性应用壳组合', link: '/components/desktop/neutral-shells' },
            { text: '列表布局与行操作', link: '/components/desktop/list-blocks' },
          ],
        },
      ],
      // 移动 —— 组件库式：每个组件一页，按分类分组；多组件/组合场景归入「配方 / 场景」。
      '/components/mobile': [
        {
          text: '移动',
          items: [
            { text: '概览', link: '/components/mobile/' },
            { text: '完整示例', link: '/components/mobile/gallery' },
            { text: 'NvAppShellMobile 应用外壳', link: '/components/mobile/app-shell-mobile' },
          ],
        },
        {
          text: '基础',
          items: [
            { text: 'NvMobileButton 移动按钮', link: '/components/mobile/button' },
            { text: 'NvMobileBadge 角标', link: '/components/mobile/badge' },
            { text: 'NvCell 单元格', link: '/components/mobile/cell' },
            { text: 'NvListRow 列表行', link: '/components/mobile/list-row' },
            { text: 'NvMobileDivider 分割线', link: '/components/mobile/divider' },
          ],
        },
        {
          text: '数据展示',
          items: [
            { text: 'NvMobileAvatar 头像', link: '/components/mobile/avatar' },
            { text: 'NvMobileTag 标签', link: '/components/mobile/tag' },
            { text: 'NvMobileSkeleton 骨架屏', link: '/components/mobile/skeleton' },
          ],
        },
        {
          text: '表单',
          items: [
            { text: 'NvMobileInput 输入框', link: '/components/mobile/input' },
            { text: 'NvMobileCheckbox 复选框', link: '/components/mobile/checkbox' },
            { text: 'NvMobileRadioGroup 单选框', link: '/components/mobile/radio' },
            { text: 'NvMobileSwitch 开关', link: '/components/mobile/switch' },
            { text: 'NvStepper 步进器', link: '/components/mobile/stepper' },
            { text: 'NvMobileSlider 滑块', link: '/components/mobile/slider' },
            { text: 'NvMobileRate 评分', link: '/components/mobile/rate' },
            { text: 'NvNumberKeyboard 数字键盘', link: '/components/mobile/number-keyboard' },
            { text: 'NvSearchBar 搜索栏', link: '/components/mobile/search-bar' },
            { text: 'NvPicker 滚轮选择', link: '/components/mobile/picker' },
            { text: 'NvMobileDatePicker 日期选择', link: '/components/mobile/date-picker' },
            { text: 'NvScanBar 扫码栏', link: '/components/mobile/scan-bar' },
          ],
        },
        {
          text: '导航',
          items: [
            { text: 'NvTabBar 标签栏', link: '/components/mobile/tab-bar' },
            { text: 'NvMobileTabs 顶部标签', link: '/components/mobile/tabs' },
            { text: 'NvMobileSteps 步骤条', link: '/components/mobile/steps' },
            { text: 'NvNavBar 顶部栏', link: '/components/mobile/nav-bar' },
            { text: 'NvMobileCollapse 折叠面板', link: '/components/mobile/collapse' },
            { text: 'NvMobileDropdownMenu 下拉筛选', link: '/components/mobile/dropdown-menu' },
          ],
        },
        {
          text: '轮播 / 图片',
          items: [
            { text: 'NvSwiper 轮播图', link: '/components/mobile/swiper' },
            { text: 'NvMobileImage 图片', link: '/components/mobile/image' },
          ],
        },
        {
          text: '反馈',
          items: [
            { text: 'NvActionSheet 动作面板', link: '/components/mobile/action-sheet' },
            { text: 'NvBottomSheet 底部抽屉', link: '/components/mobile/bottom-sheet' },
            { text: 'NvMobileDialog 对话框', link: '/components/mobile/dialog' },
            { text: 'NvMobileToast 居中提示', link: '/components/mobile/toast' },
            { text: 'NvNoticeBar 通知条', link: '/components/mobile/notice-bar' },
            { text: 'NvMobileProgress 进度条', link: '/components/mobile/progress' },
            { text: 'NvMobileResult 结果页', link: '/components/mobile/result' },
            { text: 'NvMobileEmpty 空状态', link: '/components/mobile/empty' },
            { text: 'NvMobileErrorRetry 错误重试', link: '/components/mobile/error-retry' },
          ],
        },
        {
          text: '手势 / 操作',
          items: [
            { text: 'NvFab 悬浮按钮', link: '/components/mobile/fab' },
            { text: 'NvMobileGrid 宫格', link: '/components/mobile/grid' },
            { text: 'NvPullRefresh 下拉刷新', link: '/components/mobile/pull-refresh' },
            { text: 'NvSwipeCell 侧滑操作', link: '/components/mobile/swipe-cell' },
          ],
        },
        {
          text: '长列表',
          items: [
            { text: 'NvVirtualList 虚拟列表', link: '/components/mobile/virtual-list' },
            { text: 'NvInfiniteList 无限滚动', link: '/components/mobile/infinite-list' },
          ],
        },
        {
          text: '配方 / 场景',
          items: [
            { text: '照片附件', link: '/components/mobile/photo-attachments' },
            { text: '分页列表恢复', link: '/components/mobile/task-list-shell' },
            { text: '候选与分步执行', link: '/components/mobile/flow-recipe' },
          ],
        },
      ],
      // 触屏 pad触控 —— 大触控 touch 层，每组件一页 + 触屏完整示例
      '/components/touch': touchSidebar,
      '/components/board': touchSidebar,
      // 大屏 —— 独立 --nv-scr-* 深色令牌层，每组件一页，按分类分组；多组件/组合场景归入「配方 / 场景」。
      '/components/screen': [
        {
          text: '大屏',
          items: [{ text: '概览', link: '/components/screen/' }],
        },
        {
          text: '基础设施',
          items: [
            { text: 'NvScreenScaler 舞台缩放', link: '/components/screen/screen-scaler' },
            { text: 'NvScrollBoard 无缝滚动板', link: '/components/screen/scroll-board' },
            { text: 'useScreenData 取数', link: '/components/screen/use-screen-data' },
          ],
        },
        {
          text: '容器 / 外壳',
          items: [
            { text: 'NvScreenPanel 面板', link: '/components/screen/screen-panel' },
            { text: 'NvScreenScrollArea 滚动区', link: '/components/screen/screen-scroll-area' },
            { text: 'NvBorderPanel 描边面板', link: '/components/screen/border-panel' },
            { text: 'NvTechFrame 科技边框', link: '/components/screen/tech-frame' },
            { text: 'NvTitleBar 标题栏', link: '/components/screen/title-bar' },
            { text: 'NvScreenHeader 大屏页头', link: '/components/screen/screen-header' },
            { text: 'NvScreenFusionBg 等距节点与有向流', link: '/components/screen/fusion-background' },
            { text: 'NvScreenFlowLinesBg / NvScreenIsometricBlocksBg 装饰背景', link: '/components/screen/decorative-backgrounds' },
            { text: 'NvScreenLoginStage 插画入口', link: '/components/screen/login-stage' },
            { text: 'NvScreenLayout 氛围布局', link: '/components/screen/screen-layout' },
            { text: 'NvGlowDivider 辉光分割', link: '/components/screen/glow-divider' },
          ],
        },
        {
          text: '指标 / 图表',
          items: [
            { text: 'NvOeeHero 核心指标', link: '/components/screen/oee-hero' },
            { text: 'NvRingGauge 环形仪表', link: '/components/screen/ring-gauge' },
            { text: 'NvCapsuleBar 胶囊进度', link: '/components/screen/capsule-bar' },
            { text: 'NvDigitalFlop 数字翻牌', link: '/components/screen/digital-flop' },
            { text: 'NvSparkline 迷你趋势', link: '/components/screen/sparkline' },
            { text: 'NvScreenTrendChart 趋势图', link: '/components/screen/trend-chart' },
            { text: 'NvScreenBarChart 柱状图', link: '/components/screen/screen-bar-chart' },
            { text: 'NvScreenDonut 环形占比', link: '/components/screen/screen-donut' },
            { text: 'NvScreenPareto 帕累托', link: '/components/screen/screen-pareto' },
          ],
        },
        {
          text: '数据 / 状态',
          items: [
            { text: 'NvScreenSummaryCard 入口与摘要', link: '/components/screen/summary-card' },
            { text: 'NvScreenStatusCard 状态卡', link: '/components/screen/status-card' },
            { text: 'NvKpiBar 指标条', link: '/components/screen/kpi-bar' },
            { text: 'NvAlarmTable 告警表', link: '/components/screen/alarm-table' },
            { text: 'NvScreenStatusLight 状态灯', link: '/components/screen/status-light' },
            { text: 'NvScreenStatusWall 分组状态墙', link: '/components/screen/status-wall' },
            { text: 'NvScreenHeatmap 分档热力格', link: '/components/screen/heatmap' },
            { text: 'NvScreenStageFlow 阶段数量流', link: '/components/screen/stage-flow' },
            { text: 'NvScreenStatusHero 远距主灯', link: '/components/screen/status-hero' },
            { text: 'NvScreenStatusTag 状态标签', link: '/components/screen/status-tag' },
          ],
        },
        {
          text: '控件',
          items: [
            { text: 'NvScreenButton 大屏按钮', link: '/components/screen/screen-button' },
            { text: 'NvScreenInput 输入框', link: '/components/screen/screen-input' },
            { text: 'NvScreenSelect 下拉选择', link: '/components/screen/screen-select' },
            { text: 'NvScreenSearch 搜索框', link: '/components/screen/screen-search' },
            { text: 'NvScreenTable 数据表格', link: '/components/screen/screen-table' },
            { text: 'NvScreenTabs 标签页', link: '/components/screen/screen-tabs' },
            { text: 'NvScreenSegmented 分段控制', link: '/components/screen/screen-segmented' },
            { text: 'NvScreenSwitch 开关', link: '/components/screen/screen-switch' },
            { text: 'NvScreenPagination 分页', link: '/components/screen/screen-pagination' },
          ],
        },
        {
          text: '配方 / 场景',
          items: [
            { text: '详情与参数取值', link: '/components/screen/detail-parameter' },
            { text: '大屏分栏组合', link: '/components/screen/dashboard-recipes' },
          ],
        },
      ],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/Mang-X/Nerv-IIP' }],
    search: { provider: 'local' },
    outline: { level: [2, 3], label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    darkModeSwitchLabel: '外观',
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    lastUpdatedText: '最后更新',
  },

  vite: {
    // llmstxt：机读通道，产出 llms.txt 与每页 markdown。默认 stripHTML 会剥掉
    // <script setup> 与 <Demo> 脚手架，属性表与代码围栏保留——变体事实由属性表承载。
    // 站点转多语言后须加 ignoreFiles 排除非默认 locale：插件只产一份根 llms.txt，
    // 会把所有 locale 混排进同一张目录（见 #1889 实测）。
    plugins: [
      {
        name: 'docs-css-layer-order',
        transformIndexHtml: registerCssLayers,
      },
      wasm(),
      tailwindcss(),
      llmstxt(),
    ],
    css: {
      // ADR 0020 §4.2 — official style isolation. `postcssIsolateStyles` appends
      // `:not(:where(.vp-raw, .vp-raw *))` to VitePress's own reset selectors so
      // they stop leaking into component demos. The default only isolates
      // `base.css` (global `h1..h6`/`button` resets); we ADD `vp-doc.css` so the
      // prose typography (`.vp-doc table` borders/zebra, heading margins, link
      // colour) also stops bleeding onto demos wrapped in `.vp-raw`
      // (`<Demo>`/`<ScreenDemo>`/`<MobileDoc>` roots). Replaces the old per-case
      // `.vp-doc` counter-rules; the removed `revert-layer` hack stays removed.
      postcss: {
        plugins: [
          postcssIsolateStyles({
            includeFiles: [/base\.css/, /vp-doc\.css/],
            // TimePicker candidates teleport to body, outside Demo's vp-raw root.
            // Keep the exemption local to those columns; component styles own selection.
            prefix: ':not(:where(.vp-raw, .vp-raw *, .nv-tp-col, .nv-tp-col *))',
          }),
        ],
      },
    },
    resolve: {
      dedupe: ['vue'],
    },
  },
})
