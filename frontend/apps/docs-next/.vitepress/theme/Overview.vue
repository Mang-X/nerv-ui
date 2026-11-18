<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import { NvIcon, NvInput } from '@nerv-ui/desktop'
import { data } from '../data/components.data'
import { styles } from './overview.styles'

/**
 * 组件总览：四个场景各一页，页面内容由 `components.data.ts` 扫描 md 生成，
 * 分组沿用 `themeConfig.sidebar` 的分组，避免再多一份手写名单。
 */
const props = defineProps<{ section: 'desktop' | 'mobile' | 'pad' | 'screen' }>()

const { theme } = useData()

interface SidebarLeaf {
  text: string
  link?: string
  items?: SidebarLeaf[]
}

const prefix = computed(() => `/${props.section}/`)

/** 该分区的侧栏分组（`sidebar` 是对象时按前缀取）。 */
const groups = computed<SidebarLeaf[]>(() => {
  const raw = theme.value.sidebar
  if (!raw || Array.isArray(raw)) return []
  return (raw as Record<string, SidebarLeaf[]>)[prefix.value] ?? []
})

const describe = (url: string) => data.find((item) => item.url === url)?.desc ?? ''

/** 把侧栏的分组结构拍平成「分组 → 条目」；分组没有子组时整页只有一组。 */
const sections = computed(() => {
  const out: Array<{ text: string; items: Array<{ text: string; link: string; desc: string }> }> =
    []
  for (const group of groups.value) {
    const flat: Array<{ text: string; link: string; desc: string }> = []
    const nested: Array<{ text: string; items: typeof flat }> = []
    for (const entry of group.items ?? []) {
      if (entry.items?.length) {
        nested.push({
          text: entry.text,
          items: entry.items
            .filter((leaf): leaf is SidebarLeaf & { link: string } => !!leaf.link)
            .map((leaf) => ({ text: leaf.text, link: leaf.link, desc: describe(leaf.link) })),
        })
      } else if (entry.link) {
        flat.push({ text: entry.text, link: entry.link, desc: describe(entry.link) })
      }
    }
    if (flat.length) out.push({ text: group.text, items: flat })
    out.push(...nested)
  }
  return out
})

const query = ref('')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return sections.value
  return sections.value
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => item.text.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q),
      ),
    }))
    .filter((section) => section.items.length)
})

const total = computed(() => filtered.value.reduce((sum, section) => sum + section.items.length, 0))

/**
 * 只有一个分组时（移动 / 触屏 / 大屏）分组名和页面标题是同一个词，
 * 再画一行只会重复标题；这种情况直接出网格。
 */
const showSectionHead = computed(() => sections.value.length > 1)

const sx = {
  root: stylex.props(styles.root),
  search: stylex.props(styles.search),
  section: stylex.props(styles.section),
  sectionHead: stylex.props(styles.sectionHead),
  sectionTitle: stylex.props(styles.sectionTitle),
  count: stylex.props(styles.count),
  totalLine: stylex.props(styles.totalLine),
  grid: stylex.props(styles.grid),
  card: stylex.props(styles.card),
  cardTitle: stylex.props(styles.cardTitle),
  cardName: stylex.props(styles.cardName),
  cardDesc: stylex.props(styles.cardDesc),
  empty: stylex.props(styles.empty),
}
</script>

<template>
  <div :class="[sx.root.className, 'nv-overview']" :style="sx.root.style">
    <NvInput
      v-model="query"
      clearable
      :class="sx.search.className"
      :style="sx.search.style"
      placeholder="搜索组件名或用途"
      aria-label="搜索组件"
    >
      <template #prefix><NvIcon name="search" :size="15" /></template>
    </NvInput>

    <p v-if="!showSectionHead" :class="sx.totalLine.className" :style="sx.totalLine.style">
      {{ total }} 个组件
    </p>

    <section
      v-for="section in filtered"
      :key="section.text"
      :class="sx.section.className"
      :style="sx.section.style"
    >
      <div v-if="showSectionHead" :class="sx.sectionHead.className" :style="sx.sectionHead.style">
        <h2 :class="sx.sectionTitle.className" :style="sx.sectionTitle.style">
          {{ section.text }}
        </h2>
        <span :class="sx.count.className" :style="sx.count.style">{{ section.items.length }}</span>
      </div>
      <div :class="sx.grid.className" :style="sx.grid.style">
        <a
          v-for="item in section.items"
          :key="item.link"
          :href="item.link"
          :class="sx.card.className"
          :style="sx.card.style"
        >
          <span :class="sx.cardTitle.className" :style="sx.cardTitle.style">
            <span :class="sx.cardName.className" :style="sx.cardName.style">{{ item.text }}</span>
          </span>
          <span v-if="item.desc" :class="sx.cardDesc.className" :style="sx.cardDesc.style">
            {{ item.desc }}
          </span>
        </a>
      </div>
    </section>

    <p v-if="total === 0" :class="sx.empty.className" :style="sx.empty.style">没有匹配的组件。</p>
  </div>
</template>
