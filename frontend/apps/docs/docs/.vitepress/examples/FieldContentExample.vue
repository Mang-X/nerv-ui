<script setup lang="ts">
import { ref, useId } from 'vue'
import {
  NvField,
  NvFieldGroup,
  NvFieldContent,
  NvFieldTitle,
  NvFieldLabel,
  NvFieldDescription,
  NvFieldSeparator,
  NvInput,
  NvSelect,
  NvSelectContent,
  NvSelectItem,
  NvSelectTrigger,
  NvSelectValue,
} from '@nerv-ui/ui'
const id = useId()
const topic = ref('随手阅读')
const display = ref('简洁')
</script>

<template>
  <section class="w-full min-w-0" :aria-labelledby="`${id}-title`">
    <NvFieldGroup class="min-w-0">
      <NvFieldTitle
        :id="`${id}-title`"
        role="heading"
        aria-level="3"
        class="max-w-full whitespace-normal break-words"
        >本页阅读偏好</NvFieldTitle
      >
      <NvField orientation="horizontal" class="min-w-0">
        <NvFieldLabel :for="`${id}-topic`" class="shrink-0">主题</NvFieldLabel>
        <NvFieldContent class="min-w-0">
          <NvInput
            :id="`${id}-topic`"
            v-model="topic"
            :aria-describedby="`${id}-topic-description`"
          />
          <NvFieldDescription :id="`${id}-topic-description`" class="break-words"
            >写下你最近想阅读的主题。这里仅调整本页显示偏好，完整文字会在下方反馈中换行显示，不会发送或保存。</NvFieldDescription
          >
        </NvFieldContent>
      </NvField>
      <NvFieldSeparator>显示方式</NvFieldSeparator>
      <NvField orientation="responsive" class="min-w-0">
        <NvFieldLabel :for="`${id}-display`">内容密度</NvFieldLabel>
        <NvFieldContent class="min-w-0">
          <NvSelect v-model="display">
            <NvSelectTrigger
              :id="`${id}-display`"
              :aria-describedby="`${id}-display-description`"
              class="w-full min-w-0"
            >
              <NvSelectValue placeholder="选择密度" />
            </NvSelectTrigger>
            <NvSelectContent>
              <NvSelectItem value="简洁">简洁</NvSelectItem>
              <NvSelectItem value="详细">详细</NvSelectItem>
            </NvSelectContent>
          </NvSelect>
          <NvFieldDescription :id="`${id}-display-description`"
            >窄幅上下排列，内容区足够宽时标签与控件并排。</NvFieldDescription
          >
        </NvFieldContent>
      </NvField>
      <p role="status" class="min-w-0 break-words text-sm text-muted-foreground">
        本页偏好：{{ topic }}；{{ display }}。刷新后不保留。
      </p>
    </NvFieldGroup>
  </section>
</template>
