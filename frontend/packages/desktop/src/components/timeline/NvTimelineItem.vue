<script setup lang="ts">
import {
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from '@ui-sdk/vue/timeline'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { omitClassStyle } from '../../internal/attrs'
import { focus } from '../../theme/shared.stylex'
import { styles } from './Timeline.styles'
import type { NvTimelineItemProps } from './types'

// 标记、连接线、时间、标题、说明都是原语的部件：`aria-current="step"`、
// `data-first` / `data-last`、`aria-labelledby` 由原语写到对应元素上，样式按这些
// 属性生效，而不是自己再算一遍。
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvTimelineItemProps>(), {
  value: undefined,
  time: undefined,
  datetime: undefined,
  title: undefined,
  description: undefined,
  status: undefined,
  tone: 'default',
  href: undefined,
})

const itemSx = computed(() => stylex.props(styles.item))
const dotSx = computed(() =>
  stylex.props(
    styles.dot,
    props.status === 'complete' && styles.dotComplete,
    props.status === 'current' && styles.dotCurrent,
    props.tone === 'danger' && styles.dotDanger,
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
  <TimelineItem
    v-bind="omitClassStyle($attrs)"
    :value="value"
    :status="status"
    :class="[itemSx.className, $attrs.class]"
    :style="[itemSx.style, $attrs.style]"
  >
    <TimelineMarker :class="dotSx.className" :style="dotSx.style" />
    <TimelineConnector :class="railSx.className" :style="railSx.style" data-nv-timeline-rail />
    <div :class="bodySx.className" :style="bodySx.style">
      <slot name="time">
        <TimelineTime
          v-if="time"
          :datetime="datetime"
          :class="timeSx.className"
          :style="timeSx.style"
        >
          {{ time }}
        </TimelineTime>
      </slot>
      <TimelineTitle :class="headingSx.className" :style="headingSx.style">
        <slot name="title">
          <a v-if="href" :href="href" :class="linkSx.className" :style="linkSx.style">{{
            title
          }}</a>
          <span v-else-if="title">{{ title }}</span>
        </slot>
      </TimelineTitle>
      <slot name="description">
        <TimelineDescription
          v-if="description"
          :class="descriptionSx.className"
          :style="descriptionSx.style"
        >
          {{ description }}
        </TimelineDescription>
      </slot>
      <slot />
    </div>
  </TimelineItem>
</template>
