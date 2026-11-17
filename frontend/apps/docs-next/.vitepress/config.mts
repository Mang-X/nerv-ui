import { defineConfig } from 'vitepress'
import stylex from '@stylexjs/unplugin/vite'

export default defineConfig({
  title: 'NvUI',
  description: 'NvUI 组件库文档',
  vite: {
    plugins: [stylex({ classNamePrefix: 'nx' })],
  },
  themeConfig: {
    nav: [{ text: '组件', link: '/components/button' }],
    sidebar: [
      {
        text: '桌面组件',
        items: [
          { text: 'NvButton 按钮', link: '/components/button' },
          { text: 'NvInput 输入框', link: '/components/input' },
          { text: 'NvTextarea 文本域', link: '/components/textarea' },
          { text: 'NvSelect 选择器', link: '/components/select' },
          { text: 'NvCheckbox 复选框', link: '/components/checkbox' },
          { text: 'NvRadio 单选框', link: '/components/radio' },
          { text: 'NvSwitch 开关', link: '/components/switch' },
          { text: 'NvSlider 滑块', link: '/components/slider' },
          { text: 'NvDialog 对话框', link: '/components/dialog' },
          { text: 'NvAlertDialog 警告对话框', link: '/components/alert-dialog' },
          { text: 'NvSheet 抽屉', link: '/components/sheet' },
          { text: 'NvPopover 气泡卡片', link: '/components/popover' },
          { text: 'NvTooltip 文字提示', link: '/components/tooltip' },
          { text: 'NvTabs 标签页', link: '/components/tabs' },
        ],
      },
      {
        text: '移动组件',
        items: [
          { text: 'NvMobileButton 按钮', link: '/components/mobile-button' },
          { text: 'NvCell 单元格', link: '/components/cell' },
          { text: 'NvListRow 列表行', link: '/components/list-row' },
          { text: 'NvMobileInput 输入框', link: '/components/mobile-input' },
          { text: 'NvSearchBar 搜索栏', link: '/components/search-bar' },
          { text: 'NvMobileSwitch 开关', link: '/components/mobile-switch' },
          { text: 'NvMobileCheckbox 复选框', link: '/components/mobile-checkbox' },
          { text: 'NvMobileRadio 单选框', link: '/components/mobile-radio' },
          { text: 'NvMobileTabs 标签页', link: '/components/mobile-tabs' },
          { text: 'NvTabBar 底部导航栏', link: '/components/tab-bar' },
          { text: 'NvBottomSheet 底部面板', link: '/components/bottom-sheet' },
          { text: 'NvMobileToast 轻提示', link: '/components/mobile-toast' },
          { text: 'NvNoticeBar 通知条', link: '/components/notice-bar' },
          { text: 'NvMobileDivider 分割线', link: '/components/mobile-divider' },
          { text: 'NvMobileTag 标签', link: '/components/mobile-tag' },
        ],
      },
      {
        text: '触屏组件',
        items: [
          { text: 'NvTouchButton 触屏按钮', link: '/components/touch-button' },
          { text: 'NvQtyStepper 数量步进器', link: '/components/qty-stepper' },
          { text: 'NvStatTile 指标卡', link: '/components/stat-tile' },
          { text: 'NvStationBar 工位条', link: '/components/station-bar' },
          { text: 'NvSegmented 分段控件', link: '/components/segmented' },
        ],
      },
      {
        text: '大屏组件',
        items: [
          { text: 'NvScreenButton 大屏按钮', link: '/components/screen-button' },
          { text: 'NvScreenInput 大屏输入框', link: '/components/screen-input' },
          { text: 'NvScreenSelect 大屏选择器', link: '/components/screen-select' },
          { text: 'NvScreenPanel 大屏面板', link: '/components/screen-panel' },
          { text: 'NvKpiBar 关键指标条', link: '/components/kpi-bar' },
          { text: 'NvRingGauge 环形仪表', link: '/components/ring-gauge' },
          { text: 'NvDigitalFlop 数字翻牌', link: '/components/digital-flop' },
          { text: 'NvScreenHeader 大屏页头', link: '/components/screen-header' },
          { text: 'NvScreenScaler 大屏缩放容器', link: '/components/screen-scaler' },
        ],
      },
    ],
  },
})
