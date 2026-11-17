<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Grid.styles'
import type { MobileGridItem, MobileGridProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileGridProps>(), {
  // Undefined, not false: a default would make the selection controlled and the
  // grid could never pick a cell on its own.
  modelValue: undefined,
  defaultValue: null,
  columns: 4,
  bordered: false,
  ariaLabel: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  select: [item: MobileGridItem]
}>()

const inner = ref<string | null>(props.defaultValue)

const selected = computed(() =>
  props.modelValue !== undefined ? props.modelValue : inner.value,
)

const rootSx = computed(() =>
  stylex.props(styles.root, styles[`cols${props.columns}` as const]),
)

function pick(item: MobileGridItem) {
  if (item.disabled) return
  inner.value = item.value
  emit('update:modelValue', item.value)
  emit('select', item)
}
</script>

<template>
  <div
    v-bind="$attrs"
    role="group"
    :aria-label="ariaLabel"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <slot name="empty">
      <div v-if="!items.length" :class="stylex.props(styles.empty).className">暂无内容</div>
    </slot>
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      :disabled="item.disabled"
      :aria-pressed="selected === item.value"
      :class="
        stylex.props(
          styles.cell,
          focus.subtle,
          selected === item.value && styles.selected,
        ).className
      "
      @click="pick(item)"
    >
      <span v-if="item.badge !== undefined && item.badge !== ''" :class="stylex.props(styles.badge).className">
        {{ item.badge }}
      </span>
      <span v-if="item.icon || $slots.icon" :class="stylex.props(styles.icon).className">
        <slot name="icon" :item="item">
          <component :is="item.icon" aria-hidden="true" :size="24" />
        </slot>
      </span>
      <span :class="stylex.props(styles.label).className">
        <slot name="label" :item="item">{{ item.label }}</slot>
      </span>
      <span v-if="item.description" :class="stylex.props(styles.description).className">
        {{ item.description }}
      </span>
    </button>
  </div>
</template>
