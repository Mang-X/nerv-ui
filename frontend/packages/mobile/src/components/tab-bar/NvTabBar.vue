<script setup lang="ts">
import { Tabs, TabsList, TabsTab, TabsTabIcon } from '@ui-sdk/vue/tabs'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './TabBar.styles'
import type { MobileTabBarItem } from './types'

const props = withDefaults(
  defineProps<{
    items: MobileTabBarItem[]
    modelValue?: string | null
    defaultValue?: string | null
    ariaLabel?: string
    fixed?: boolean
  }>(),
  {
    modelValue: undefined,
    defaultValue: null,
    ariaLabel: '主导航',
    fixed: true,
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()
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
</script>

<template>
  <Tabs :value="value" :class="stylex.props(styles.root).className" @value-change="value = $event">
    <TabsList
      :aria-label="ariaLabel"
      :class="stylex.props(styles.bar, !fixed && styles.barStatic, styles.list).className"
    >
      <TabsTab
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :disabled="item.disabled"
        :class="stylex.props(styles.tab, value === item.value && styles.tabSelected, focus.subtle).className"
      >
        <TabsTabIcon v-if="item.icon" :class="stylex.props(styles.icon).className">
          <component :is="item.icon" aria-hidden="true" :size="22" />
        </TabsTabIcon>
        <span :class="stylex.props(styles.label).className">
          <slot :name="`label-${item.value}`">{{ item.label }}</slot>
        </span>
        <span
          v-if="item.badge !== undefined && item.badge !== ''"
          :class="stylex.props(styles.badge).className"
        >{{ item.badge }}</span>
        <span v-else-if="item.dot" :class="stylex.props(styles.dot).className" />
      </TabsTab>
    </TabsList>
  </Tabs>
</template>
