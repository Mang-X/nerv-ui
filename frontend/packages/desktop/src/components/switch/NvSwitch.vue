<script setup lang="ts">
import { Switch, SwitchThumb } from '@ui-sdk/vue/switch'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './Switch.styles'
import type { NvSwitchProps } from './types'

defineOptions({ inheritAttrs: false })

withDefaults(defineProps<NvSwitchProps>(), { disabled: false, required: false })


const sx = computed(() => stylex.props(styles.root, focus.ring))
const thumbSx = computed(() => stylex.props(styles.thumb))
</script>

<template>
  <Switch
    v-bind="omitClassStyle($attrs)"
    :checked="checked"
    :default-checked="defaultChecked"
    :disabled="disabled"
    :required="required"
    :name="name"
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
  >
    <SwitchThumb :class="thumbSx.className" :style="thumbSx.style" />
  </Switch>
</template>
