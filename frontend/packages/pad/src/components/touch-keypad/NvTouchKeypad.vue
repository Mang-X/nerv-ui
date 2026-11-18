<script setup lang="ts">
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './TouchKeypad.styles'
import type { TouchKeypadProps } from './types'

const props = withDefaults(defineProps<TouchKeypadProps>(), {
  modelValue: undefined,
  defaultValue: '',
  allowDecimal: true,
  allowNegative: false,
  maxLength: 12,
  disabled: false,
  display: true,
  placeholder: '0',
  showConfirm: true,
  showClear: false,
  confirmLabel: '确认',
  clearLabel: '清空',
  deleteLabel: '退格',
  signLabel: '正负号',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  confirm: [value: string]
}>()

// Local state carries the uncontrolled case; the prop wins once a caller
// attaches `v-model`.
const inner = ref(props.defaultValue)
const value = computed(() => props.modelValue ?? inner.value)

function commit(next: string) {
  inner.value = next
  emit('update:modelValue', next)
}

function append(char: string) {
  if (props.disabled) return
  if (value.value.length + char.length > props.maxLength) return
  if (char === '.' && value.value.includes('.')) return
  if (char === '.' && value.value === '') {
    commit('0.')
    return
  }
  commit(`${value.value}${char}`)
}

function toggleSign() {
  if (props.disabled) return
  if (value.value.startsWith('-')) {
    commit(value.value.slice(1))
    return
  }
  if (value.value === '' || value.value === '0') return
  commit(`-${value.value}`)
}

function backspace() {
  if (props.disabled) return
  commit(value.value.slice(0, -1))
}

function clear() {
  if (props.disabled) return
  commit('')
}

function confirm() {
  if (props.disabled) return
  emit('confirm', value.value)
}

const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

const rootSx = computed(() => stylex.props(styles.root))
const readoutSx = computed(() => stylex.props(styles.readout))
const valueSx = computed(() =>
  stylex.props(styles.readoutValue, !value.value && styles.readoutPlaceholder),
)
const gridSx = computed(() => stylex.props(styles.grid))
const keySx = computed(() => stylex.props(styles.key, focus.ring))
const mutedKeySx = computed(() => stylex.props(styles.key, styles.mutedKey, focus.ring))
const actionsSx = computed(() => stylex.props(styles.actions))
const actionSx = computed(() => stylex.props(styles.action, focus.ring))
const clearSx = computed(() => stylex.props(styles.action, styles.clear, focus.ring))
const confirmSx = computed(() => stylex.props(styles.action, styles.confirm, focus.ring))
</script>

<template>
  <div :class="rootSx.className" :style="rootSx.style">
    <div v-if="display || $slots.display" :class="readoutSx.className" :style="readoutSx.style">
      <slot name="display">
        <span :class="valueSx.className" :style="valueSx.style">{{ value || placeholder }}</span>
      </slot>
    </div>

    <div :class="gridSx.className" :style="gridSx.style">
      <button
        v-for="digit in digits"
        :key="digit"
        type="button"
        :disabled="disabled"
        :class="keySx.className"
        :style="keySx.style"
        @click="append(digit)"
      >
        {{ digit }}
      </button>
      <button
        type="button"
        :disabled="disabled"
        :class="keySx.className"
        :style="keySx.style"
        @click="append('0')"
      >
        0
      </button>
      <button
        v-if="allowDecimal"
        type="button"
        :disabled="disabled"
        :class="keySx.className"
        :style="keySx.style"
        @click="append('.')"
      >
        .
      </button>
      <button
        v-else
        type="button"
        :disabled="disabled"
        :class="mutedKeySx.className"
        :style="mutedKeySx.style"
        @click="append('00')"
      >
        00
      </button>
      <button
        type="button"
        :aria-label="deleteLabel"
        :disabled="disabled"
        :class="mutedKeySx.className"
        :style="mutedKeySx.style"
        @click="backspace"
      >
        <NvIcon name="trash" :size="26" />
      </button>
    </div>

    <div
      v-if="allowNegative || showClear || showConfirm || $slots.actions"
      :class="actionsSx.className"
      :style="actionsSx.style"
    >
      <slot name="actions">
        <button
          v-if="allowNegative"
          type="button"
          :aria-label="signLabel"
          :disabled="disabled"
          :class="actionSx.className"
          :style="actionSx.style"
          @click="toggleSign"
        >
          +/−
        </button>
        <button
          v-if="showClear"
          type="button"
          :disabled="disabled"
          :class="clearSx.className"
          :style="clearSx.style"
          @click="clear"
        >
          {{ clearLabel }}
        </button>
        <button
          v-if="showConfirm"
          type="button"
          :disabled="disabled"
          :class="confirmSx.className"
          :style="confirmSx.style"
          @click="confirm"
        >
          {{ confirmLabel }}
        </button>
      </slot>
    </div>
  </div>
</template>
