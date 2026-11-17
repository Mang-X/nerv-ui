<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Timeline.styles'
import type { NvTimelineItemProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvTimelineItemProps>(), {
  time: undefined,
  datetime: undefined,
  title: undefined,
  description: undefined,
  status: 'default',
  href: undefined,
})

const itemSx = computed(() => stylex.props(styles.item))
const dotSx = computed(() =>
  stylex.props(
    styles.dot,
    props.status === 'active' && styles.dotActive,
    props.status === 'danger' && styles.dotDanger,
  ),
)
const railSx = computed(() => stylex.props(styles.rail))
const bodySx = computed(() => stylex.props(styles.body))
const timeSx = computed(() => stylex.props(styles.time))
const headingSx = computed(() => stylex.props(styles.heading))
const linkSx = computed(() => stylex.props(styles.link, focus.subtle))
const descriptionSx = computed(() => stylex.props(styles.description))
</script>

<template>
  <li
    v-bind="omitClassStyle($attrs)"
    :class="[itemSx.className, $attrs.class]"
    :style="[itemSx.style, $attrs.style]"
  >
    <span :class="dotSx.className" :style="dotSx.style" aria-hidden="true" />
    <span
      :class="railSx.className"
      :style="railSx.style"
      data-nv-timeline-rail
      aria-hidden="true"
    />
    <div :class="bodySx.className" :style="bodySx.style">
      <slot name="time">
        <time v-if="time" :datetime="datetime" :class="timeSx.className" :style="timeSx.style">
          {{ time }}
        </time>
      </slot>
      <div :class="headingSx.className" :style="headingSx.style">
        <slot name="title">
          <a v-if="href" :href="href" :class="linkSx.className" :style="linkSx.style">{{
            title
          }}</a>
          <span v-else-if="title">{{ title }}</span>
        </slot>
      </div>
      <slot name="description">
        <p v-if="description" :class="descriptionSx.className" :style="descriptionSx.style">
          {{ description }}
        </p>
      </slot>
      <slot />
    </div>
  </li>
</template>
