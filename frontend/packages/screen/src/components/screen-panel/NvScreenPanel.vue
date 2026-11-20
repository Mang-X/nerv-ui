<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, useSlots } from 'vue'
import { styles } from './ScreenPanel.styles'
import type { ScreenPanelTone } from './types'

const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    tone?: ScreenPanelTone
    padded?: boolean
    scroll?: boolean
  }>(),
  { tone: 'default', padded: true, scroll: true },
)

const slots = useSlots()
const rootSx = computed(() =>
  stylex.props(styles.root, props.tone === 'default' ? null : styles[props.tone]),
)
const bodySx = computed(() =>
  stylex.props(styles.body, props.padded ? null : styles.bodyBare, props.scroll && styles.bodyPaddedScroll),
)
const showHeader = computed(
  () => Boolean(props.title || props.subtitle) || Boolean(slots.header) || Boolean(slots.actions),
)
</script>

<template>
  <section :class="rootSx.className" :style="rootSx.style">
    <header v-if="showHeader" :class="stylex.props(styles.header).className">
      <slot name="header">
        <div :class="stylex.props(styles.heading).className">
          <h2 v-if="title" :class="stylex.props(styles.title).className">{{ title }}</h2>
          <span v-if="subtitle" :class="stylex.props(styles.subtitle).className">{{ subtitle }}</span>
        </div>
      </slot>
      <div v-if="slots.actions" :class="stylex.props(styles.actions).className">
        <slot name="actions" />
      </div>
    </header>
    <div :class="bodySx.className" :style="bodySx.style">
      <slot />
    </div>
    <footer v-if="slots.footer" :class="stylex.props(styles.footer).className">
      <slot name="footer" />
    </footer>
  </section>
</template>
