<script setup lang="ts">
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from '@ui-sdk/vue/tabs'
import * as stylex from '@stylexjs/stylex'
import { computed, useSlots } from 'vue'
import { darkTheme } from '../../theme/tokens.stylex'
import { focus } from '../../theme/shared.stylex'
import { styles } from './ScreenTabs.styles'
import type { ScreenTabItem, ScreenTabsOrientation, ScreenTabsSize } from './types'

// ui-sdk treats every attached `onUpdate:*` listener as a controller. The
// wrapper never binds its own listener: `$attrs` carries the consumer's
// `onUpdate:value` untouched, so both controlled and uncontrolled usage work.
defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    items: ScreenTabItem[]
    /** Controlled value (`v-model:value`); leave undefined for internal state. */
    value?: string | null
    defaultValue?: string | null
    orientation?: ScreenTabsOrientation
    activation?: 'automatic' | 'manual'
    loop?: boolean
    stretch?: boolean
    size?: ScreenTabsSize
    disabled?: boolean
    /** Render a panel per tab. Only visible when a panel/default slot exists. */
    showPanels?: boolean
    keepPanels?: boolean
    ariaLabel?: string
  }>(),
  {
    value: undefined,
    defaultValue: undefined,
    orientation: 'horizontal',
    activation: 'automatic',
    loop: true,
    stretch: true,
    size: 'md',
    disabled: false,
    showPanels: true,
    keepPanels: false,
    ariaLabel: '标签页',
  },
)

const slots = useSlots()

const rootSx = computed(() => stylex.props(darkTheme, styles.root))
const listSx = computed(() =>
  stylex.props(styles.list, props.orientation === 'vertical' && styles.listVertical),
)
const indicatorSx = computed(() =>
  stylex.props(styles.indicator, props.orientation === 'vertical' && styles.indicatorVertical),
)

function tabSx(item: ScreenTabItem) {
  return stylex.props(
    styles.tab,
    focus.subtle,
    props.size === 'lg' ? styles.sizeLg : styles.sizeMd,
    props.stretch ? styles.tabStretch : styles.tabFixed,
    props.orientation === 'vertical' && styles.tabVertical,
  )
}

function panelSx() {
  return stylex.props(styles.panel, props.orientation === 'vertical' && styles.panelVertical)
}

const hasPanels = computed(() => props.showPanels && Boolean(slots.panel || slots.default))
</script>

<template>
  <Tabs
    v-bind="$attrs"
    :value="value"
    :default-value="defaultValue"
    :orientation="orientation"
    :activation="activation"
    :loop="loop"
    :aria-label="ariaLabel"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <TabsList :class="listSx.className" :style="listSx.style">
      <TabsIndicator :class="indicatorSx.className" :style="indicatorSx.style" />
      <TabsTab
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="disabled || item.disabled"
        :class="tabSx(item).className"
        :style="tabSx(item).style"
      >
        <span :class="stylex.props(styles.label).className">{{ item.label }}</span>
        <span v-if="item.badge !== undefined && item.badge !== ''" :class="stylex.props(styles.badge).className">
          {{ item.badge }}
        </span>
      </TabsTab>
    </TabsList>
    <template v-if="hasPanels">
      <TabsPanel
        v-for="(item, index) in items"
        :key="item.value"
        :value="item.value"
        :keep-mounted="keepPanels"
        :class="panelSx().className"
        :style="panelSx().style"
      >
        <slot name="panel" :item="item" :index="index">
          <slot :item="item" :index="index" />
        </slot>
      </TabsPanel>
    </template>
  </Tabs>
</template>
