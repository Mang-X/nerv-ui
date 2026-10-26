<script setup lang="ts">
import { NvButton, NvInput } from '@nerv-iip/ui'
import type {
  SchedulingHorizonInput,
  SchedulingHorizonPreset,
  SchedulingHorizonValidation,
} from './types'

const props = withDefaults(
  defineProps<{
    modelValue: SchedulingHorizonInput
    presets: readonly SchedulingHorizonPreset[]
    validation: SchedulingHorizonValidation
    idPrefix?: string
    timezoneLabel?: string
    disabled?: boolean
  }>(),
  { idPrefix: 'request-horizon' },
)
const emit = defineEmits<{ 'update:modelValue': [value: SchedulingHorizonInput] }>()
function update(patch: Partial<SchedulingHorizonInput>) {
  if (!props.disabled) emit('update:modelValue', { ...props.modelValue, ...patch })
}
</script>

<template>
  <fieldset class="grid gap-3 rounded-md border border-border p-3" :disabled="disabled">
    <legend class="px-1 text-sm font-medium">安排窗口</legend>
    <div class="flex flex-wrap gap-2" aria-label="窗口类型">
      <NvButton
        v-for="preset in presets"
        :key="preset.key"
        type="button"
        size="sm"
        :variant="
          modelValue.mode === 'preset' && modelValue.presetKey === preset.key
            ? 'default'
            : 'outline'
        "
        :aria-pressed="modelValue.mode === 'preset' && modelValue.presetKey === preset.key"
        :disabled="disabled"
        :data-preset="preset.key"
        @click="update({ mode: 'preset', presetKey: preset.key })"
        >{{ preset.label }}</NvButton
      >
      <NvButton
        type="button"
        size="sm"
        :variant="modelValue.mode === 'custom' ? 'default' : 'outline'"
        :aria-pressed="modelValue.mode === 'custom'"
        :disabled="disabled"
        data-action="custom"
        @click="update({ mode: 'custom' })"
        >自定义起止时间</NvButton
      >
    </div>
    <template v-if="modelValue.mode === 'custom'">
      <label class="grid gap-1 text-sm" :for="`${idPrefix}-start`"
        >开始时间<NvInput
          :id="`${idPrefix}-start`"
          type="datetime-local"
          :model-value="modelValue.startLocal"
          :disabled="disabled"
          :aria-invalid="!validation.valid"
          @update:model-value="update({ startLocal: String($event) })"
      /></label>
      <label class="grid gap-1 text-sm" :for="`${idPrefix}-end`"
        >结束时间<NvInput
          :id="`${idPrefix}-end`"
          type="datetime-local"
          :model-value="modelValue.endLocal"
          :disabled="disabled"
          :aria-invalid="!validation.valid"
          @update:model-value="update({ endLocal: String($event) })"
      /></label>
    </template>
    <p v-if="timezoneLabel" class="text-sm text-muted-foreground">
      输入按{{ timezoneLabel }}解释；时间范围由来源核对。
    </p>
    <p
      :role="validation.valid ? 'status' : 'alert'"
      :class="validation.valid ? 'text-muted-foreground' : 'text-destructive'"
      class="text-sm"
    >
      {{ validation.message }}
    </p>
  </fieldset>
</template>
