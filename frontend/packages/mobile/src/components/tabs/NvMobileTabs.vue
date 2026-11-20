<script setup lang="ts">
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
  TabsTabIcon,
} from '@ui-sdk/vue/tabs'
import * as stylex from '@stylexjs/stylex'
import { computed, ref, useSlots } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './MobileTabs.styles'
import type { MobileTabItem } from './types'

const props = withDefaults(
  defineProps<{
    items: MobileTabItem[]
    modelValue?: string | null
    defaultValue?: string | null
    ariaLabel?: string
    activation?: 'automatic' | 'manual'
    loop?: boolean
  }>(),
  {
    modelValue: undefined,
    defaultValue: null,
    ariaLabel: '标签页',
    activation: 'automatic',
    loop: true,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()
const slots = useSlots()
const inner = ref<string | null>(props.defaultValue)

const value = computed({
  get: () => {
    if (props.modelValue !== undefined) return props.modelValue
    if (inner.value !== null) return inner.value
    return props.items.find((item) => !item.disabled)?.value ?? null
  },
  set: (next: string | null) => {
    inner.value = next
    emit('update:modelValue', next)
  },
})

function hasPanel(tab: MobileTabItem) {
  return typeof slots[`panel-${tab.value}`] === 'function'
}
</script>

<template>
  <Tabs
    :value="value"
    :activation="activation"
    :loop="loop"
    :class="stylex.props(styles.root).className"
    @value-change="value = $event"
  >
    <TabsList :aria-label="ariaLabel" :class="stylex.props(styles.list).className">
      <TabsTab
        v-for="tab in items"
        :key="tab.value"
        :value="tab.value"
        :disabled="tab.disabled"
        :class="stylex.props(styles.tab, value === tab.value && styles.tabSelected, focus.subtle).className"
      >
        <TabsTabIcon v-if="tab.icon" :class="stylex.props(styles.tabIcon).className">
          <component :is="tab.icon" aria-hidden="true" :size="16" />
        </TabsTabIcon>
        <slot :name="`label-${tab.value}`">{{ tab.label }}</slot>
      </TabsTab>
      <TabsIndicator :class="stylex.props(styles.indicator).className" />
    </TabsList>
    <template v-for="tab in items" :key="`panel-${tab.value}`">
      <TabsPanel
        v-if="hasPanel(tab)"
        :value="tab.value"
        :class="stylex.props(styles.panel).className"
      >
        <slot :name="`panel-${tab.value}`" />
      </TabsPanel>
    </template>
  </Tabs>
</template>
