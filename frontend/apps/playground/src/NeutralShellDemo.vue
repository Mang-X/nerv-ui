<script setup lang="ts">
import { ref, computed } from 'vue'
import { NvButton, NvBadge, NvDropdownMenuItem } from '@nerv-iip/ui'
import NeutralShell from './NeutralShell.vue'
const props = defineProps<{ space: 'library' | 'studio' }>()
const studio = props.space === 'studio'
const title = studio ? '周末画室' : '晨光书房'
const items = ref([
  { key: 'welcome', label: studio ? '创作日程' : '阅读日程' },
  { key: 'rooms', label: studio ? '水彩与素描的共享创作空间' : '诗歌与绘本的安静阅读空间' },
  { key: 'rest', label: '暂未开放', disabled: true },
])
const currentKey = ref('welcome')
const user = ref<{ key: string; name: string } | undefined>({ key: 'lin', name: '林悦' })
const message = ref('欢迎回来')
const accept = ref(true)
const current = computed(
  () => items.value.find((item) => item.key === currentKey.value)?.label ?? '请选择空间',
)
function navigate(key: string) {
  if (accept.value) currentKey.value = key
}
function signOut() {
  user.value = undefined
  message.value = '已离开，愿你度过愉快的一天'
}
function replace() {
  items.value = items.value.map((item) => ({
    ...item,
    label: item.key === 'rooms' ? '午后相聚' : item.label,
  }))
  user.value = { key: 'zhou', name: '周宁' }
}
</script>
<template>
  <NeutralShell
    :title="title"
    :layout="studio ? 'top' : 'side'"
    :items="items"
    :current-key="currentKey"
    :user="user"
    :recent="items.slice(0, 1)"
    :starred="items.slice(1, 2)"
    @navigate="navigate"
    @open-search="message = '想去哪里？请从空间菜单选择。'"
    @sign-out="signOut"
  >
    <template #header="{ user: person }"
      ><span v-if="person" class="text-sm">{{ person.name }}，你好</span></template
    >
    <template #user-menu-items="{ user: person }"
      ><NvDropdownMenuItem @select="message = `${person?.name}的个人安排`"
        >个人安排</NvDropdownMenuItem
      ></template
    >
    <template #sidebar-footer
      ><a href="#" class="p-2 underline">返回首页</a
      ><a :href="studio ? '#shell/library' : '#shell/studio'" class="p-2 underline">{{
        studio ? '晨光书房' : '周末画室'
      }}</a></template
    >
    <h1 class="text-xl font-semibold">{{ current }}</h1>
    <NvBadge variant="neutral">{{ user ? '自在浏览' : '期待再见' }}</NvBadge>
    <p role="status">{{ message }}</p>
    <div class="flex flex-wrap gap-2">
      <NvButton variant="outline" @click="items = [...items].reverse()">换个顺序</NvButton>
      <NvButton variant="outline" @click="replace">迎接新朋友</NvButton>
      <NvButton variant="outline" @click="accept = !accept">{{
        accept ? '留在此页' : '自由切换'
      }}</NvButton>
    </div>
  </NeutralShell>
</template>
