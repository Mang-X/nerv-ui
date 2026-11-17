<script setup lang="ts">
import { ref, useId } from 'vue'
import {
  NvFormSection,
  NvField,
  NvFieldLabel,
  NvButton,
  NvSelect,
  NvSelectTrigger,
  NvSelectValue,
  NvSelectContent,
  NvSelectGroup,
  NvSelectItem,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  SelectItem,
} from '@nerv-iip/ui'
const id = useId()
const region = ref('北岸')
const activity = ref('阅读分享')
const regions = [
  {
    title: '沿岸',
    values: ['北岸', '南岸', '东湾', '西湾', '浅湾', '长湾', '松岸', '竹岸', '柳岸', '沙岸'],
  },
  {
    title: '山间',
    values: ['青山', '白岭', '云谷', '松谷', '竹谷', '溪谷', '石岭', '林间', '湖畔', '泉边'],
  },
]
const activities = [
  {
    title: '交流',
    values: [
      '阅读分享',
      '书画交流',
      '音乐欣赏',
      '摄影交流',
      '诗歌朗读',
      '故事分享',
      '手作交流',
      '园艺交流',
      '茶话交流',
      '文化漫谈',
    ],
  },
  {
    title: '户外',
    values: [
      '公园散步',
      '湖边漫步',
      '自然观察',
      '花园赏花',
      '林间步行',
      '观鸟活动',
      '日出观赏',
      '星空观察',
      '沿岸步行',
      '植物观察',
    ],
  },
]
function reset() {
  region.value = '北岸'
  activity.value = '阅读分享'
}
</script>

<template>
  <form class="min-w-0 space-y-6" @submit.prevent>
    <NvFormSection
      title="本页活动偏好"
      description="选择想去的区域和感兴趣的活动。较长的说明会随可用宽度换行，所有选择仅保留在当前页面，刷新后恢复初始偏好。"
      :columns="2"
    >
      <template #actions
        ><NvButton type="button" variant="outline" size="sm" @click="reset"
          >重置</NvButton
        ></template
      >
      <NvField>
        <NvFieldLabel :for="`${id}-region`">区域</NvFieldLabel>
        <NvSelect v-model="region">
          <NvSelectTrigger :id="`${id}-region`"
            ><NvSelectValue placeholder="选择区域"
          /></NvSelectTrigger>
          <NvSelectContent>
            <template v-for="(group, index) in regions" :key="group.title">
              <SelectSeparator v-if="index" />
              <NvSelectGroup>
                <SelectLabel>{{ group.title }}</SelectLabel>
                <NvSelectItem v-for="value in group.values" :key="value" :value="value">{{
                  value
                }}</NvSelectItem>
              </NvSelectGroup>
            </template>
          </NvSelectContent>
        </NvSelect>
      </NvField>
      <NvField>
        <NvFieldLabel :for="`${id}-activity`">活动</NvFieldLabel>
        <Select v-model="activity">
          <SelectTrigger :id="`${id}-activity`" class="w-full"
            ><SelectValue placeholder="选择活动"
          /></SelectTrigger>
          <SelectContent>
            <template v-for="(group, index) in activities" :key="group.title">
              <SelectSeparator v-if="index" />
              <SelectGroup>
                <SelectLabel>{{ group.title }}</SelectLabel>
                <SelectItem v-for="value in group.values" :key="value" :value="value">{{
                  value
                }}</SelectItem>
              </SelectGroup>
            </template>
          </SelectContent>
        </Select>
      </NvField>
    </NvFormSection>
    <NvFormSection title="当前选择" :columns="1">
      <p role="status" class="min-w-0 break-words text-sm">
        本页偏好：{{ region }}；{{ activity }}。刷新后不保留。
      </p>
    </NvFormSection>
    <NvFormSection
      title="参与提示"
      description="出发前可与同行者商量安排；如需调整，随时返回上方重新选择。"
      :columns="3"
    >
      <p class="text-sm">按兴趣选择活动。</p>
      <p class="text-sm">留出适合自己的休息时间。</p>
      <p class="text-sm">根据天气调整出行安排。</p>
    </NvFormSection>
  </form>
</template>
