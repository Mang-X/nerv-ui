<script setup lang="ts">
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-sdk/vue/select'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed, getCurrentInstance, inject } from 'vue'
import { dropdownMenuKey, type MobileDropdownMenuContext } from './context'
import { styles } from './DropdownMenu.styles'
import type { NvMobileDropdownMenuItemProps } from './types'

/**
 * 筛选栏里的一项：当前值作为按钮文字，点开是选项面板。
 *
 * 展开态由栏（`NvMobileDropdownMenu`）持有，这里只发 open/close——
 * 于是「同时只开一个」是结构决定的，不靠各条目互相通知。
 */
const props = defineProps<NvMobileDropdownMenuItemProps>()

const model = defineModel<string | number>()
const emit = defineEmits<{ change: [value: string | number] }>()

const injected = inject(dropdownMenuKey)
if (!injected) throw new Error('NvMobileDropdownMenuItem 必须放在 NvMobileDropdownMenu 里')
// 拿到后再收窄一次：闭包里读 `injected` 时 TS 不会记住上面的守卫。
const ctx: MobileDropdownMenuContext = injected

const id = `nv-ddm-${getCurrentInstance()?.uid ?? 'x'}`
const isOpen = computed({
  get: () => ctx.openId.value === id,
  set: (value: boolean) => {
    if (value) ctx.open(id)
    else ctx.close()
  },
})

const selectedLabel = computed(
  () => props.options.find((option) => option.value === model.value)?.label ?? props.title,
)
const isActive = computed(() => model.value != null)

function pick(value: string | number) {
  model.value = value
  emit('change', value)
  ctx.close()
}

const sx = computed(() => {
  const open = isOpen.value
  const active = isActive.value || open
  return {
    item: stylex.props(styles.item),
    trigger: stylex.props(styles.trigger, active && styles.triggerActive),
    label: stylex.props(styles.label),
    chevron: stylex.props(styles.chevron, open && styles.chevronOpen),
    content: stylex.props(styles.content),
    option: stylex.props(styles.option),
    optionSelected: stylex.props(styles.option),
    check: stylex.props(styles.check),
  }
})
</script>

<template>
  <div :class="sx.item.className" :style="sx.item.style">
    <Select v-model="model" v-model:open="isOpen">
      <SelectTrigger
        :class="sx.trigger.className"
        :style="sx.trigger.style"
        :aria-label="props.label ?? selectedLabel"
      >
        <SelectValue :placeholder="props.title" :class="sx.label.className" :style="sx.label.style" />
        <span :class="sx.chevron.className" :style="sx.chevron.style" aria-hidden="true">
          <NvIcon name="chevron-down" :size="16" />
        </span>
      </SelectTrigger>
      <SelectContent :class="sx.content.className" :style="sx.content.style">
        <SelectItem
          v-for="option in props.options"
          :key="option.value"
          :value="option.value"
          :label="option.label"
          :class="[sx.option.className, option.value === model && sx.optionSelected.className]"
          :style="sx.option.style"
          @select="pick(option.value)"
        >
          <span :class="sx.label.className" :style="sx.label.style">{{ option.label }}</span>
          <span v-if="option.value === model" :class="sx.check.className" :style="sx.check.style" aria-hidden="true">
            <NvIcon name="check" :size="16" />
          </span>
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
