<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import { Input, InputClear, InputGroup } from '@ui-sdk/vue/input'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref, useAttrs } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './SearchBar.styles'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    defaultValue?: string
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    showCancel?: boolean
    cancelText?: string
    clearLabel?: string
  }>(),
  {
    modelValue: undefined,
    defaultValue: '',
    placeholder: '搜索',
    disabled: false,
    readonly: false,
    showCancel: false,
    cancelText: '取消',
    clearLabel: '清除搜索',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: [value: string]
  cancel: []
}>()

const attrs = useAttrs()
const inner = ref(props.defaultValue)
const model = computed({
  get: () => (props.modelValue !== undefined ? props.modelValue : inner.value),
  set: (value: string) => {
    inner.value = value
    emit('update:modelValue', value)
  },
})

const groupSx = computed(() =>
  stylex.props(styles.group, focus.ring, props.disabled && styles.disabled),
)
const inputAttrs = computed(() => {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class' || key === 'style') continue
    out[key] = value
  }
  return out
})

function onEnter() {
  if (props.disabled) return
  emit('search', model.value)
}
</script>

<template>
  <div
    :class="[stylex.props(styles.root).className, attrs.class]"
    :style="attrs.style"
    @keydown.enter="onEnter"
  >
    <InputGroup :class="groupSx.className" :style="groupSx.style">
      <span :class="stylex.props(styles.icon).className">
        <Search aria-hidden="true" :size="18" />
      </span>
      <Input
        v-model="model"
        type="search"
        enterkeyhint="search"
        :class="stylex.props(styles.input).className"
        :placeholder="placeholder"
        :disabled="disabled"
        :read-only="readonly"
        v-bind="inputAttrs"
      />
      <InputClear
        :aria-label="clearLabel"
        :class="stylex.props(styles.clear, focus.ring).className"
      >
        <NvIcon name="close" :size="18" />
      </InputClear>
    </InputGroup>
    <Button
      v-if="showCancel"
      type="button"
      :class="stylex.props(styles.cancel, focus.ring).className"
      @click="emit('cancel')"
    >
      <slot name="cancel">{{ cancelText }}</slot>
    </Button>
  </div>
</template>
