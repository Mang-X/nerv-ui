<script setup lang="ts">
import { Button } from '@ui-sdk/vue/button'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { styles } from './ErrorRetry.styles'
import type { MobileErrorRetryProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MobileErrorRetryProps>(), {
  title: '加载失败',
  description: undefined,
  retryText: '重试',
  loading: false,
  size: 'md',
})

const emit = defineEmits<{ retry: [] }>()

const rootSx = computed(() => stylex.props(styles.root, props.size === 'sm' && styles.sm))
</script>

<template>
  <div
    v-bind="$attrs"
    role="alert"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <div :class="stylex.props(styles.icon).className">
      <slot name="icon">
        <NvIcon name="alert-circle" :size="28" />
      </slot>
    </div>
    <div :class="stylex.props(styles.content).className">
      <slot name="title">
        <h3 v-if="title" :class="stylex.props(styles.title).className">{{ title }}</h3>
      </slot>
      <slot name="description">
        <p v-if="description" :class="stylex.props(styles.description).className">{{ description }}</p>
      </slot>
    </div>
    <slot>
      <Button
        type="button"
        :disabled="loading"
        :aria-busy="loading || undefined"
        :class="stylex.props(styles.retry, focus.ring).className"
        @click="emit('retry')"
      >
        <NvIcon name="loader-circle"
          v-if="loading"
          :size="18"
          :class="stylex.props(styles.spinner).className"
        />
        <NvIcon name="refresh" v-else :size="18" />
        <span>{{ retryText }}</span>
      </Button>
    </slot>
  </div>
</template>
