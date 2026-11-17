---
title: R2 验证
---

<script setup>
import { ref } from 'vue'
import {
  NvDatePicker,
  NvDateRangePicker,
  NvTimePicker,
  NvCombobox,
  NvCommand,
  NvAutocomplete,
  NvRating,
  NvFileInput,
} from '@nerv-ui/desktop'
import '@nerv-ui/desktop/styles.css'

const date = ref('2026-11-18')
const range = ref(['2026-11-10', '2026-11-14'])
const time = ref('14:30')
const combo = ref('orange')
const fruits = [
  { value: 'apple', label: '苹果' },
  { value: 'banana', label: '香蕉' },
  { value: 'orange', label: '橙子' },
  { value: 'grape', label: '葡萄' },
  { value: 'durian', label: '榴莲（缺货）', disabled: true },
]
const cmd = ref(null)
function runCommand(value) {
  cmd.value = value
}
const commandItems = [
  { group: '文件', value: 'new-file', label: '新建文件', shortcut: 'mod+n' },
  { group: '文件', value: 'open-file', label: '打开文件', shortcut: 'mod+o' },
  { group: '编辑', value: 'search', label: '在项目中搜索' },
  { group: '编辑', value: 'settings', label: '偏好设置' },
]
const auto = ref('')
const suggestions = ['北京', '上海', '广州', '深圳', '杭州', '成都']
const rating = ref(3)
const files = ref([])
</script>

# R2 日期与联想组件验证

<div style="display:flex;flex-wrap:wrap;gap:24px;align-items:flex-start">

<div style="width:260px">
<h3>NvDatePicker</h3>
<NvDatePicker v-model:value="date" clearable />
<p>value: {{ date }}</p>
</div>

<div style="width:340px">
<h3>NvDateRangePicker</h3>
<NvDateRangePicker v-model:value="range" clearable />
<p>value: {{ range }}</p>
</div>

<div style="width:160px">
<h3>NvTimePicker</h3>
<NvTimePicker v-model:value="time" />
<p>value: {{ time }}</p>
</div>

<div style="width:260px">
<h3>NvCombobox</h3>
<NvCombobox v-model:value="combo" :items="fruits" clearable />
<p>value: {{ combo }}</p>
</div>

<div style="width:300px">
<h3>NvAutocomplete</h3>
<NvAutocomplete v-model:value="auto" :items="suggestions" clearable />
<p>value: {{ auto }}</p>
</div>

<div style="width:360px">
<h3>NvCommand</h3>
<NvCommand :items="commandItems" @action="runCommand" />
<p>action: {{ cmd }}</p>
</div>

<div style="width:260px">
<h3>NvRating</h3>
<NvRating v-model:value="rating" aria-label="评分" />
<p>value: {{ rating }}</p>
</div>

<div style="width:340px">
<h3>NvFileInput</h3>
<NvFileInput v-model:value="files" multiple accept=".pdf,.png,.txt" />
<p>files: {{ files.length }}</p>
</div>

</div>
