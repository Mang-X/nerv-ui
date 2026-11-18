<script setup lang="ts">
import { NvAccordion, NvAccordionItem, NvSidebar, NvSidebarItem } from '@nerv-ui/desktop'
import * as stylex from '@stylexjs/stylex'
import { computed, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { styles } from './layout.styles'

interface SidebarLeaf {
  text: string
  link: string
}
interface SidebarEntry {
  text: string
  link?: string
  items?: SidebarLeaf[]
}
interface SidebarGroup {
  text: string
  items: SidebarEntry[]
}

const { page, theme } = useData()

const sx = {
  inner: stylex.props(styles.sidebarInner),
  nav: stylex.props(styles.sidebarNav),
  list: stylex.props(styles.list),
  subList: stylex.props(styles.subList),
  subTitle: stylex.props(styles.subTitle),
}

const groups = computed<SidebarGroup[]>(() => {
  const raw = theme.value.sidebar
  return Array.isArray(raw) ? (raw as SidebarGroup[]) : []
})

/** `/components/button` — 与 sidebar 里的 link 同口径（去掉 .md 与 index）。 */
const current = computed(() => {
  const path = page.value.relativePath.replace(/\.md$/, '')
  return path === 'index' ? '/' : `/${path}`
})

function isActive(link?: string) {
  return !!link && link === current.value
}

function sectionHasActive(group: SidebarGroup) {
  return group.items.some(
    (entry) => isActive(entry.link) || (entry.items ?? []).some((leaf) => isActive(leaf.link)),
  )
}

const activeGroups = computed(() =>
  groups.value
    .map((group, index) => (sectionHasActive(group) ? String(index) : null))
    .filter((value): value is string => value !== null),
)

// 受控展开：换页时把当前页所在分组「并入」已展开集合，用户手动开的组不会被关掉。
const open = ref<string[]>(activeGroups.value)
watch(activeGroups, (next) => {
  if (!next.length) return
  open.value = [...new Set([...open.value, ...next])]
})

const accordionSx = stylex.props(styles.sidebarNav)
</script>

<template>
  <NvSidebar :collapsible="false" :width="256" label="组件导航" :class="[sx.inner.className]" :style="sx.inner.style">
    <NvAccordion
      multiple
      :value="open"
      :class="accordionSx.className"
      :style="accordionSx.style"
      @update:value="open = $event as string[]"
    >
      <NvAccordionItem v-for="(group, index) in groups" :key="group.text" :value="String(index)" :title="group.text">
        <div :class="sx.list.className" :style="sx.list.style">
          <template v-for="entry in group.items" :key="entry.text">
            <NvSidebarItem v-if="entry.link" :href="entry.link" :active="isActive(entry.link)">
              {{ entry.text }}
            </NvSidebarItem>
            <div v-else :class="sx.subTitle.className" :style="sx.subTitle.style">{{ entry.text }}</div>
            <div v-if="entry.items" :class="sx.subList.className" :style="sx.subList.style">
              <NvSidebarItem
                v-for="leaf in entry.items"
                :key="leaf.link"
                :href="leaf.link"
                :active="isActive(leaf.link)"
              >
                {{ leaf.text }}
              </NvSidebarItem>
            </div>
          </template>
        </div>
      </NvAccordionItem>
    </NvAccordion>
  </NvSidebar>
</template>
