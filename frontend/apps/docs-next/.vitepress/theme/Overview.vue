<script setup lang="ts">
import * as stylex from '@stylexjs/stylex'
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import { NvIcon, NvInput } from '@nerv-ui/desktop'
import { data } from '../data/components.data'
import Cover from './Cover.vue'
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

type Entry = { text: string; link: string; slug: string; desc: string }

/** 把侧栏的分组结构拍平成「分组 → 条目」；分组没有子组时整页只有一组。 */
const sections = computed(() => {
  const out: Array<{ text: string; items: Entry[] }> = []
  for (const group of groups.value) {
    const flat: Entry[] = []
    const nested: Array<{ text: string; items: Entry[] }> = []
    for (const entry of group.items ?? []) {
      if (entry.items?.length) {
        nested.push({
          text: entry.text,
          items: entry.items
            .filter((leaf): leaf is SidebarLeaf & { link: string } => !!leaf.link)
            .map((leaf) => ({
              text: leaf.text,
              link: leaf.link,
              // `/desktop/button` → `button`，封面按 slug 查
              slug: leaf.link.split('/').pop() ?? '',
              desc: describe(leaf.link),
            })),
        })
      } else if (entry.link) {
        flat.push({
          text: entry.text,
          link: entry.link,
          slug: entry.link.split('/').pop() ?? '',
          desc: describe(entry.link),
        })
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
  grid: stylex.props(styles.grid),
  card: stylex.props(styles.card),
  cardHead: stylex.props(styles.cardHead),
  empty: stylex.props(styles.empty),
}
</script>

<template>
  <div :class="[sx.root.className, 'nv-overview']" :style="sx.root.style">
    <NvInput
      v-model="query"
      clearable
      size="lg"
      :class="sx.search.className"
      :style="sx.search.style"
      placeholder="搜索组件名或用途"
      aria-label="搜索组件"
    >
      <template #prefix><NvIcon name="search" :size="16" /></template>
    </NvInput>

    <section
      v-for="section in filtered"
      :key="section.text"
      :class="sx.section.className"
      :style="sx.section.style"
    >
      <!-- 分组头四页共用一套语法。单分组分区（移动 / 触屏 / 大屏）的分组名
           就是页面标题，h2 省略，但数量徽标照旧出现，不降级成一行灰字。 -->
      <div :class="sx.sectionHead.className" :style="sx.sectionHead.style">
        <h2
          v-if="showSectionHead"
          :class="sx.sectionTitle.className"
          :style="sx.sectionTitle.style"
        >
          {{ section.text }}
        </h2>
        <span v-else :class="sx.sectionTitle.className" :style="sx.sectionTitle.style"
          >全部组件</span
        >
        <span :class="sx.count.className" :style="sx.count.style">{{ section.items.length }}</span>
      </div>
      <div :class="sx.grid.className" :style="sx.grid.style">
        <a
          v-for="item in section.items"
          :key="item.link"
          :href="item.link"
          :class="sx.card.className"
          :style="sx.card.style"
          :aria-label="item.text"
        >
          <span :class="sx.cardHead.className" :style="sx.cardHead.style">{{ item.text }}</span>
          <Cover :slug="item.slug" />
        </a>
      </div>
    </section>

    <p v-if="total === 0" :class="sx.empty.className" :style="sx.empty.style">没有匹配的组件。</p>
  </div>
</template>
