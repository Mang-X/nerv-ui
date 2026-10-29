<script setup lang="ts">
import { ref, computed } from 'vue'
import { NvButton, NvBadge, NvDropdownMenuItem } from '@nerv-iip/ui'
import NeutralShell from './NeutralShell.vue'
import NeutralShellNavigation from './NeutralShellNavigation.vue'
const props = defineProps<{ space: 'library' | 'studio' }>()
const studio = props.space === 'studio'
const title = studio ? '周末画室' : '晨光书房'
const items = ref([
  { key: 'welcome', label: studio ? '创作日程' : '阅读日程' },
  { key: 'rooms', label: studio ? '水彩与素描的共享创作空间' : '诗歌与绘本的安静阅读空间' },
  { key: 'rest', label: '暂未开放', disabled: true },
])
const domains = ref([
  { key: 'quiet', label: '静享时光' },
  { key: 'together', label: '相聚时光' },
])
const domainKey = ref('quiet')
const pageKeys = ref<Record<string, string>>({ quiet: 'welcome', together: 'gather' })
const otherItems = [
  { key: 'gather', label: '相聚日程' },
  { key: 'garden', label: '花园小聚' },
]
const pages = computed(() => (domainKey.value === 'quiet' ? items.value : otherItems))
const sideItems = computed(() =>
  studio ? pages.value : [{ key: 'moments', label: '美好时光', children: pages.value }],
)
const currentKey = computed({
  get: () => pageKeys.value[domainKey.value],
  set: (key) => {
    pageKeys.value[domainKey.value] = key
  },
})
function selectDomain(key: string) {
  if (accept.value) domainKey.value = key
}

const user = ref<{ key: string; name: string } | undefined>({ key: 'lin', name: '林悦' })
const message = ref('欢迎回来')
const accept = ref(true)
const current = computed(
  () => pages.value.find((item) => item.key === currentKey.value)?.label ?? '请选择空间',
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
    :items="sideItems"
    :top-domains="domains"
    :current-domain-key="domainKey"
    @select-domain="selectDomain"
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
    <template #sidebar-footer>
      <NeutralShellNavigation>
        <slot name="navigation">
          <a href="#" class="p-2 underline">返回首页</a>
          <a :href="studio ? '#shell/library' : '#shell/studio'" class="p-2 underline">{{
            studio ? '晨光书房' : '周末画室'
          }}</a>
        </slot>
      </NeutralShellNavigation>
    </template>
    <h1 class="text-xl font-semibold">{{ current }}</h1>
    <NvBadge variant="neutral">{{ user ? '自在浏览' : '期待再见' }}</NvBadge>
    <p role="status">{{ message }}</p>
    <div class="flex flex-wrap gap-2">
      <template v-if="!studio"
        ><NvButton
          v-for="domain in domains"
          :key="domain.key"
          :data-host-domain="domain.key"
          :aria-pressed="domain.key === domainKey"
          variant="outline"
          @click="selectDomain(domain.key)"
          >{{ domain.label }}</NvButton
        ></template
      >
      <NvButton variant="outline" @click="items = [...items].reverse()">换个顺序</NvButton>
      <NvButton variant="outline" @click="replace">迎接新朋友</NvButton>
      <NvButton variant="outline" @click="accept = !accept">{{
        accept ? '留在此页' : '自由切换'
      }}</NvButton>
    </div>
  </NeutralShell>
</template>
