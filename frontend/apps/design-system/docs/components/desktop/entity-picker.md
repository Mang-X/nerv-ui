---
title: NvEntityPicker / NvCascadePicker 实体选择与级联选择
---

<script setup>
import { NvEntityPicker, NvCascadePicker, NvField, NvFieldLabel } from '@nerv-iip/ui'
import { computed, ref } from 'vue'
import EntityDialogExample from '../../.vitepress/examples/EntityDialogExample.vue'
import EntityCreateExample from '../../.vitepress/examples/EntityCreateExample.vue'
import EntitySearchExample from '../../.vitepress/examples/EntitySearchExample.vue'

const material = ref('')
const materialOptions = [
  { value: 'SKU-FG-100', label: '示例项 A', hint: '类别 A' },
  { value: 'SKU-FG-200', label: '示例项 B', hint: '类别 A' },
  { value: 'RM-200', label: '示例项 C', hint: '类别 B' },
  { value: 'RM-300', label: '示例项 D', hint: '类别 B' },
]

const scope = ref({ workshop: '', line: '', device: '' })
const lineCatalog = [
  { value: 'LINE-01', label: '分组一', workshop: 'WS-01' },
  { value: 'LINE-02', label: '分组二', workshop: 'WS-02' },
]
const deviceCatalog = [
  { value: 'DEV-01', label: '节点 01', line: 'LINE-01' },
  { value: 'DEV-02', label: '节点 02', line: 'LINE-02' },
]
const scopeLevels = computed(() => [
  { key: 'workshop', label: '区域', options: [
    { value: 'WS-01', label: 'Alpha 区域' },
    { value: 'WS-02', label: 'Beta 区域' },
  ] },
  { key: 'line', label: '分组', options: lineCatalog
    .filter((l) => !scope.value.workshop || l.workshop === scope.value.workshop)
    .map(({ value, label }) => ({ value, label })) },
  { key: 'device', label: '节点', options: deviceCatalog
    .filter((d) => (!scope.value.line || d.line === scope.value.line)
      && lineCatalog.some((l) => l.value === d.line
        && (!scope.value.workshop || l.workshop === scope.value.workshop)))
    .map(({ value, label }) => ({ value, label })) },
])
</script>

# NvEntityPicker / NvCascadePicker 实体选择与级联选择

两个 `blocks/` 层的**选择类区块件**，都是「仅选不填」：把手输编码换成从主数据目录里挑。

## 何时使用

| 组件                           | 语义                                 | 典型场景                          |
| ------------------------------ | ------------------------------------ | --------------------------------- |
| **NvEntityPicker** 实体选择器  | 默认可搜索的下拉，也可显式使用对话框 | 条目 / 类别 / 属性等主数据目录    |
| **NvCascadePicker** 级联选择器 | 一行多级依赖选择，上级变化清空下游   | 区域 → 分组 → 节点 的范围下钻     |

- 单实体、目录大（≥ 50 条）或需要展示名称 + 编码 + 辅助信息 → **NvEntityPicker**。
- 多级父子范围（区域▸分组▸节点）→ **NvCascadePicker**。
- 单实体、集合中等且一行放得下 → [`NvSearchSelect`](/components/desktop/combobox)。
- 值可能不在集合内（允许自由录入）→ [`NvCombobox`](/components/desktop/combobox)。

## 示例

`NvEntityPicker` 默认 `variant="dropdown"` 就地展开可搜索列表；需要更大展示空间时显式使用 `variant="dialog"`。两种形态均展示**名称 + 编码 + 辅助信息**。`clearable` 时触发按钮出现清除叉；只需枚举值时可使用更轻的 [`NvSearchSelect`](/components/desktop/combobox)。

下拉里只放用户做选择要用的东西：不写数据来自哪个模块，也不报「共 N 条」。目录大到要服务端搜索时（`server-search` + `total-count`），结果多于当前列出的条目才在底部提示「输入关键字继续筛选」；列表滚近底部时发出 `load-more`，调用方取下一页追加进 `options`。候选超过 100 条时列表只渲染可视区附近的行（虚拟化），几千条也能顺滑滚动；键盘上下移动高亮项时会把它滚进可视区。

<Demo>
  <div style="max-width: 360px">
    <NvField>
      <NvFieldLabel for="ep-material">条目</NvFieldLabel>
      <NvEntityPicker
        id="ep-material"
        v-model="material"
        :options="materialOptions"
        title="选择条目"
        placeholder="请选择条目"
        aria-label="条目"
        clearable
      />
    </NvField>
    <p style="margin-top: 8px; font-size: 13px; color: var(--vp-c-text-2)">当前值：{{ material || '（未选）' }}</p>
  </div>
</Demo>

```vue
<NvEntityPicker
  v-model="material"
  :options="[{ value: 'SKU-FG-100', label: '示例项 A', hint: '类别 A' }]"
  title="选择条目"
  placeholder="请选择条目"
  :invalid="submitted && !material"
  clearable
/>
```

表单提交后校验失败时传入 `invalid`。组件会给根节点设置 `data-invalid`、给触发按钮设置 `aria-invalid`，并使用错误态边框；打开表单时不要提前传入错误态。字段下方有错误提示时，把提示的 id 传给 `aria-describedby`，组件会把它转发到触发按钮上，读屏在这个字段上能念到错误。它必须作为组件属性传入：组件的根节点不是 DOM 元素，写在外层包装上的同名属性不会落到按钮上。

`variant="dialog"` 显式使用对话框形态，与上方默认下拉持有各自的选择值。可按名称或编码搜索，选择后在本页显示当前名称与编码；关闭或按 Escape 不改变已选值，清除后回到未选。示例使用本地候选，不提交业务变更。

<Demo block>
  <EntityDialogExample />
</Demo>

<<< @/.vitepress/examples/EntityDialogExample.vue

表单里要选的实体可能还没建（比如登记节点时区域还不存在），传 `create-text` 后候选列表下方出现一个新增入口。点击后选择器收起并发出 `create`，由调用方打开新增表单；建好后调用方把新建项写回 `v-model`，并确保 `options` 里有这一项，触发器才显示名称而不是编码。

- 有没有新增权限由调用方判断：没有权限就不传 `create-text`，入口不出现。
- 只在表单字段上用；筛选条上的选择器不带新增入口。

```vue
<NvEntityPicker
  v-model="workshop"
  :options="workshopOptions"
  title="选择区域"
  :create-text="canCreateWorkshop ? '新增区域' : undefined"
  @create="workshopDialogOpen = true"
/>
```

下面的新增入口打开本页表单。填写名称后确认，宿主生成唯一的 `LOCAL-` 示例编码，把新项追加到候选并选中；取消不改变当前选择，空白名称不能确认。数据只在本页内存中，刷新后不保留，不会创建真实业务目录。

<Demo block>
  <EntityCreateExample />
</Demo>

<<< @/.vitepress/examples/EntityCreateExample.vue

此例通过 `NvEntityMultiPicker` 复用底层 `NvEntityPicker` 的受控搜索与 `load-more` 合同。宿主在完整的 24 项内存目录中搜索，初始显示 8 项，向下滚动追加下一批；换词后重置当前窗口，已选标签保留。可直接搜索初始窗口外的 `SPACE-017`，观察当前搜索词、匹配进度和选择回写。这是同步内存查询，不模拟网络、去抖或迟到响应；真实请求的时序仍由接入宿主处理。

<Demo block>
  <EntitySearchExample />
</Demo>

<<< @/.vitepress/examples/EntitySearchExample.vue

`NvCascadePicker` 每级第一项固定为「全部」（值 = 空串），代表不在该层收窄；选中上级会自动把下游层级清回「全部」。**层级间的选项过滤由调用方组装**（组件不感知业务字段），如按已选区域过滤分组目录。节点候选需同时满足已选区域与分组：分组为「全部」时仍只包含当前区域的节点；区域也为「全部」时才显示各区域节点。

<Demo>
  <div style="max-width: 640px">
    <NvCascadePicker v-model="scope" :levels="scopeLevels" />
    <p style="margin-top: 8px; font-size: 13px; color: var(--vp-c-text-2)">当前值：{{ scope }}</p>
  </div>
</Demo>

```vue
<NvCascadePicker
  v-model="scope"
  :levels="[
    { key: 'workshop', label: '区域', options: workshopOptions },
    { key: 'line', label: '分组', options: lineOptionsFilteredByWorkshop },
    { key: 'device', label: '节点', options: deviceOptionsFilteredByWorkshopAndLine },
  ]"
/>
```

## API

### NvEntityPicker 属性

| 属性                | 说明                                                                                  | 类型                      | 默认                  |
| ------------------- | ------------------------------------------------------------------------------------- | ------------------------- | --------------------- |
| `modelValue`        | 受控值（`v-model`）；选中的 `option.value`                                            | `string`                  | —                     |
| `options`           | 候选集合（必填）；当前页（服务端搜索时为当前已加载窗口）                              | `EntityPickerOption[]`    | —                     |
| `title`             | 选择器标题；`dialog` 形态显示在对话框顶部，否则用于派生可访问名称                    | `string`                  | —                     |
| `variant`           | 形态：`dropdown`（默认，原地弹出）或 `dialog`（居中对话框）                           | `'dropdown' \| 'dialog'`  | `'dropdown'`          |
| `placeholder`       | 未选占位                                                                              | `string`                  | `请选择`              |
| `searchPlaceholder` | 弹层内搜索框占位                                                                      | `string`                  | `搜索名称 / 编码…`   |
| `emptyText`         | 无匹配空态                                                                            | `string`                  | `无匹配实体`          |
| `loading`           | 加载中                                                                                | `boolean`                 | `false`               |
| `disabled`          | 是否禁用                                                                              | `boolean`                 | `false`               |
| `invalid`           | 校验失败态；标记根 `data-invalid` 并把 `aria-invalid` 传给触发按钮                    | `boolean`                 | `false`               |
| `clearable`         | 已选时显示清除叉                                                                      | `boolean`                 | `false`               |
| `showCode`          | 显示编码行（选项行第二行 + 触发器括号编码）；值为内部 id 时应关掉                     | `boolean`                 | `true`                |
| `search`            | 受控搜索词（`v-model:search`）；`serverSearch` 时由宿主持有                           | `string`                  | —                     |
| `serverSearch`      | 候选由服务端按搜索词过滤；打开后组件不再本地过滤                                      | `boolean`                 | `false`               |
| `totalCount`        | 服务端搜索的匹配总数；多于当前结果时底部提示「输入关键字继续筛选」                    | `number`                  | —                     |
| `createText`        | 新增入口文案；传了才在候选下方出现「新增 …」                                         | `string`                  | —                     |
| `id`                | 透传到触发 `<button>`                                                                 | `string`                  | —                     |
| `ariaLabel`         | 触发按钮的可访问名称                                                                  | `string`                  | —                     |
| `ariaDescribedby`   | 字段错误提示的 id，转发到触发按钮                                                     | `string`                  | —                     |
| `class`             | 追加 Tailwind 类                                                                      | `HTMLAttributes['class']` | —                     |

`EntityPickerOption`：`{ value: string; label: string; code?: string; hint?: string }`。

### NvEntityPicker 事件

| 事件                | 说明                                                          | 载荷     |
| ------------------- | ------------------------------------------------------------- | -------- |
| `update:modelValue` | 选中或清除时回写                                              | `string` |
| `update:search`     | `serverSearch` 时搜索词变化                                   | `string` |
| `create`            | 「新增」入口被点击；选择器已收起，由宿主打开新增表单          | —        |
| `load-more`         | 列表滚到底部且 `totalCount` 还有未加载项；宿主加载下一页追加  | —        |

### NvCascadePicker 属性

| 属性         | 说明                                                                       | 类型                       | 默认 |
| ------------ | -------------------------------------------------------------------------- | -------------------------- | ---- |
| `modelValue` | 受控各层选中值（`v-model`）；空串 = 该层「全部」                           | `Record<string, string>`   | —    |
| `levels`     | 层级定义（必填）；选中上级会自动把下游层级清回「全部」                     | `CascadePickerLevel[]`     | —    |
| `class`      | 追加 Tailwind 类                                                           | `HTMLAttributes['class']`  | —    |

`CascadePickerLevel`：`{ key: string; label: string; options: SearchSelectOption[]; placeholder?: string; allLabel?: string; loading?: boolean; disabled?: boolean }`。每层第一个选项固定为「全部」（`value: ''`），文案由 `allLabel` 覆盖。

### NvCascadePicker 事件

| 事件                | 说明                                                          | 载荷                     |
| ------------------- | ------------------------------------------------------------- | ------------------------ |
| `update:modelValue` | 某层选择变化；同层赋值，下游各层清为 `''`，整对象作为新值发出 | `Record<string, string>` |
