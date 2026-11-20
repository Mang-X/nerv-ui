<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import {
  NvScreenHeader,
  NvScreenPanel,
  NvScreenButton,
  NvScreenInput,
  NvScreenSearch,
  NvScreenSelect,
  NvScreenTabs,
  NvScreenSegmented,
  NvScreenSwitch,
} from '@nerv-ui/ui'
import { regions, spaces, longLabels } from './controls-fixtures'

const query = shallowRef('')
const people = shallowRef('0')
const region = shallowRef<string | number>(0)
const tab = shallowRef<string | number>(0)
const segment = shallowRef<string | number>(0)
const reminder = shallowRef(false)
const reminderChanges = shallowRef(0)
const disabled = shallowRef(false)
const saves = shallowRef(0)
const long = shallowRef(false)
const available = ref([...regions])
const options = computed(() =>
  available.value.map((item) => ({
    ...item,
    label: long.value
      ? longLabels[regions.findIndex((original) => original.value === item.value)]!
      : item.label,
  })),
)
const selected = computed(() => available.value.find((item) => item.value === region.value))
const invalidPeople = computed(() => !/^\d+$/.test(people.value))
const results = computed(() =>
  spaces.filter(
    (item) =>
      available.value.some((area) => area.value === item.region) &&
      item.name.includes(query.value.trim()),
  ),
)
function removeSelected() {
  available.value = available.value.filter((item) => item.value !== region.value)
}
function save() {
  if (!disabled.value && !invalidPeople.value) saves.value++
}
function updateReminder(value: boolean) {
  reminder.value = value
  reminderChanges.value++
}
</script>

<template>
  <main class="controls-stage">
    <NvScreenHeader
      title="寻找城市的一处停留"
      time="10:24:36"
      date="星期日"
      line="公共空间"
      screen="随心安排"
    />
    <div class="controls-intro">
      <div>
        <h2>把喜欢的空间，留在日程里</h2>
        <p>搜索、选择，为下一次相聚留一点时间。</p>
      </div>
      <label><input v-model="disabled" type="checkbox" aria-label="暂停编辑" /> 暂停编辑</label>
    </div>
    <div class="controls-grid">
      <NvScreenPanel title="安排一次来访" accent="cyan" class="controls-panel">
        <form class="controls-scroll" aria-label="来访安排" tabindex="0" @submit.prevent="save">
          <label class="controls-field"
            ><span>寻找空间</span
            ><NvScreenSearch
              v-model="query"
              placeholder="搜索书房、展厅或花园"
              aria-label="搜索空间"
              :disabled="disabled"
          /></label>
          <label class="controls-field"
            ><span>来访人数</span
            ><NvScreenInput
              v-model="people"
              aria-label="来访人数"
              suffix="人"
              :error="invalidPeople"
              :disabled="disabled"
          /></label>
          <p v-if="invalidPeople" role="alert">人数尚未填写正确，请填写非负整数。</p>
          <p v-else>本次人数：{{ people }} 人</p>
          <div class="controls-reminder">
            <span id="reminder-label">到访前提醒</span
            ><NvScreenSwitch
              :model-value="reminder"
              aria-labelledby="reminder-label"
              :disabled="disabled"
              @update:model-value="updateReminder"
            /><span>{{ reminder ? '已开启' : '已关闭' }}</span>
          </div>
          <p>提醒变更：{{ reminderChanges }} 次</p>
          <div class="controls-select-field">
            <span id="region-label">所在区域</span
            ><NvScreenSelect
              v-model="region"
              :options="options"
              placeholder="请选择区域"
              :disabled="disabled"
              aria-labelledby="region-label"
            />
          </div>
          <p v-if="!available.length">暂无可选区域</p>
          <p aria-label="当前区域">
            {{ selected ? `当前区域：${selected.label}` : '区域信息缺失，请重新选择' }}
          </p>
          <div class="controls-actions">
            <NvScreenButton type="submit" :disabled="disabled || invalidPeople"
              >保存安排</NvScreenButton
            ><NvScreenButton variant="secondary" :disabled="disabled" @click="query = ''"
              >查看全部</NvScreenButton
            ><NvScreenButton variant="ghost" size="sm" :disabled="disabled" @click="people = '0'"
              >清空人数</NvScreenButton
            >
          </div>
          <p role="status">已保存 {{ saves }} 次</p>
          <div class="controls-note">喜欢的空间不止一处，慢慢选择。向下翻阅，寻找下一次相遇。</div>
          <p>书房的窗边、展厅的长椅、花园的小径，都有属于你的片刻。</p>
        </form>
      </NvScreenPanel>
      <NvScreenPanel title="在空间之间漫游" accent="indigo" class="controls-panel">
        <div class="controls-scroll" aria-label="空间浏览" tabindex="0">
          <NvScreenTabs v-model="tab" :items="options" :disabled="disabled" aria-label="空间页签" />
          <p>
            正在浏览：{{ available.find((item) => item.value === tab)?.label ?? '空间信息缺失' }}
          </p>
          <NvScreenSegmented
            v-model="segment"
            :options="options"
            :disabled="disabled"
            aria-label="空间偏好"
          />
          <p>
            偏好空间：{{
              available.find((item) => item.value === segment)?.label ?? '尚无可选空间'
            }}
          </p>
          <ul aria-label="空间结果">
            <li v-for="item in results" :key="item.id">
              <strong>{{ item.name }}</strong
              ><span>{{ item.note }}</span>
            </li>
            <li v-if="!results.length">没有符合条件的空间</li>
          </ul>
          <div class="controls-fixtures" aria-label="区域安排">
            <button type="button" @click="available = [...available].reverse()">
              调整区域顺序
            </button>
            <button type="button" @click="long = !long">
              {{ long ? '恢复短标签' : '切换长标签' }}
            </button>
            <button type="button" @click="removeSelected">移除当前区域</button>
            <button type="button" @click="available = []">清空区域</button>
            <button type="button" @click="available = [...regions]">恢复区域</button>
          </div>
        </div>
      </NvScreenPanel>
    </div>
    <footer>
      <span>每一次选择，都为日常打开一扇窗。</span><a href="#screen/stage">返回空间舞台</a>
    </footer>
  </main>
</template>

<style scoped>
@layer app {
  .controls-stage {
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px 40px;
    background: var(--nv-scr-bg);
    color: var(--nv-scr-text);
    font-family: var(--font-sans);
  }
  .controls-intro {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
  .controls-intro h2 {
    font-size: 32px;
    font-weight: 600;
    margin: 0 0 8px;
  }
  .controls-stage p {
    margin: 12px 0;
    color: var(--nv-scr-muted);
    font-size: 16px;
  }
  .controls-intro label {
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 18px;
  }
  .controls-grid {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 28px;
  }
  .controls-panel {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .controls-scroll {
    min-height: 0;
    overflow: auto;
    flex: 1;
    padding: 8px 12px 12px 4px;
  }
  .controls-field {
    display: grid;
    gap: 10px;
    margin-bottom: 22px;
    font-size: 18px;
  }
  .controls-select-field {
    display: grid;
    gap: 12px;
    margin: 24px 0 8px;
  }
  .controls-reminder,
  .controls-actions {
    display: flex;
    align-items: center;
    gap: 18px;
    flex-wrap: wrap;
  }
  .controls-note {
    margin-top: 38px;
    padding: 28px 0;
    border-top: 1px solid var(--nv-scr-line);
    font-size: 22px;
  }
  .controls-stage [role='alert'] {
    color: var(--nv-scr-red);
  }
  .controls-stage ul {
    list-style: none;
    padding: 0;
    margin: 28px 0;
  }
  .controls-stage li {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    padding: 22px 0;
    border-bottom: 1px solid var(--nv-scr-line);
  }
  .controls-stage li span {
    color: var(--nv-scr-muted);
  }
  .controls-fixtures {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    margin-top: 26px;
  }
  .controls-fixtures button {
    border: 1px solid var(--nv-scr-line-2);
    border-radius: var(--nv-scr-radius);
    padding: 10px 14px;
    color: var(--nv-scr-text-2);
    background: transparent;
    cursor: pointer;
  }
  .controls-stage footer {
    flex: none;
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    color: var(--nv-scr-muted);
  }
  .controls-stage a {
    color: var(--nv-scr-cyan);
    text-decoration: underline;
  }
  .controls-stage :focus-visible {
    outline: 2px solid var(--nv-scr-cyan);
    outline-offset: 3px;
  }
}
</style>
