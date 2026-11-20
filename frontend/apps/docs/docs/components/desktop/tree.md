---
title: NvTree 层级树
---

<script setup>
import { NvTree, NvButton } from '@nerv-ui/ui'
import { ref } from 'vue'
const expanded = ref(['books'])
const selected = ref(null)
const nodes = ref([{ key: 'books', label: '晨光书房', children: [{ key: 'poems', label: '诗歌角' }] }])
</script>

# NvTree 层级树

## 示例

<Demo>
  <NvTree :nodes="nodes" label="阅读空间" v-model:expanded="expanded" v-model:selected-key="selected">
    <template #actions="{ node }"><NvButton v-if="node.key === 'books'" variant="ghost" size="sm" @click="nodes[0].children.push({ key: 'shelf-' + nodes[0].children.length, label: '新书架' })">添加书架</NvButton></template>
  </NvTree>
</Demo>

## API

| 输入                             | 类型                       | 合同                                                             |
| -------------------------------- | -------------------------- | ---------------------------------------------------------------- |
| nodes                            | NvTreeNode[]               | key、label 必填；code、children、inactive、disabled、status 可选 |
| label                            | string                     | 树的可访问名称；每项以 label 命名                                |
| expanded / update:expanded       | string[]                   | 受控展开 key；事件产生新数组                                     |
| selectedKey / update:selectedKey | string 或 null / string    | 单选请求；拒绝后不改变高亮                                       |
| emptyText                        | string                     | 默认「暂无内容」                                                 |
| actions                          | slot，{ node: NvTreeNode } | 应用决定动作类型与是否展示；点击和键盘不触发树选择               |

status 是 `{ label: string, tone: StatusTone }`。停用展示与禁止交互相互独立，详细规则见下文。

上下键、Home/End 移动焦点；右键展开或进入子项，左键折叠或回父项；Enter/Space 请求选择。焦点移动不选中。扁平可见树按 aria-level/posinset/setsize 描述层级，叶节点不输出 aria-expanded。

独立入口：`/#tree/library`、`/#tree/studio`。

<!-- @include: ../../../../../DESIGN/components/tree.md -->
