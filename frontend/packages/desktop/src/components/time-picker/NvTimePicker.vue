<script setup lang="ts">
import { TimeInput, TimeInputSegment } from '@ui-sdk/vue/time-input'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './TimePicker.styles'
import type { NvTimePickerProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvTimePickerProps>(), {
  granularity: 'minute',
})

const fieldSx = computed(() => stylex.props(styles.field, focus.ring))
const segmentSx = computed(() => stylex.props(styles.segment))
</script>

<template>
  <TimeInput
    v-bind="omitClassStyle($attrs)"
    :value="value"
    :default-value="defaultValue"
    :granularity="granularity"
    :hour-cycle="hourCycle"
    :min="min"
    :max="max"
    :locale="locale"
    :disabled="disabled"
    :read-only="readOnly"
    :required="required"
    :name="name"
    :form="form"
    :class="[fieldSx.className, $attrs.class]"
    :style="[fieldSx.style, $attrs.style]"
  >
    <!-- Render every segment ourselves so each one carries the field styling;
         literal segments (the `:` separators) get the same muted treatment. -->
    <template #default="{ state }">
      <TimeInputSegment
        v-for="segment in state.segments"
        :key="segment.key"
        :segment="segment"
        :class="segmentSx.className"
        :style="segmentSx.style"
      />
    </template>
  </TimeInput>
</template>
