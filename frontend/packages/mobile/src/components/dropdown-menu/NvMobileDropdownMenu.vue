<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, provide, ref } from 'vue'
import { dropdownMenuKey } from './context'
import { styles } from './DropdownMenu.styles'

/**
 * 移动端筛选栏：一行并排的下拉筛选项，同时只有一项展开。
 *
 * 展开态在这里集中持有并 provide 下去——每个条目自己存一份的话，
 * 从 A 点到 B 会两个都开着。
 */
const props = defineProps<{ label?: string }>()

const openId = ref<string | null>(null)

provide(dropdownMenuKey, {
  openId,
  open: (id: string) => {
    openId.value = openId.value === id ? null : id
  },
  close: () => {
    openId.value = null
  },
})

const sx = computed(() => stylex.props(styles.bar))
</script>

<template>
  <div
    :class="[sx.className, $attrs.class]"
    :style="[sx.style, $attrs.style]"
    role="group"
    :aria-label="props.label"
  >
    <slot />
  </div>
</template>
