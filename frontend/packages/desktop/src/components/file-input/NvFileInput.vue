<script setup lang="ts">
import {
  FileInput,
  FileInputDropzone,
  FileInputItem,
  FileInputItemRemove,
  FileInputList,
  FileInputTrigger,
  formatFileSize,
} from '@ui-sdk/vue/file-input'
import NvIcon from '../../theme/NvIcon.vue'
import * as stylex from '@stylexjs/stylex'
import { computed } from 'vue'
import { focus } from '../../theme/shared.stylex'
import { omitClassStyle } from '../../internal/attrs'
import { styles } from './FileInput.styles'
import type { NvFileInputProps } from './types'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<NvFileInputProps>(), {
  triggerLabel: '选择文件',
  hint: '将文件拖放到此处，或点击选择',
  dropzone: true,
  showList: true,
  listLabel: '已选文件',
  multiple: undefined,
  required: undefined,
  disabled: undefined,
})

const emit = defineEmits<{ reject: [reasons: string[]] }>()

const rootSx = computed(() => stylex.props(styles.root))
const dropzoneSx = computed(() => stylex.props(styles.dropzone, focus.ring))
const hintSx = computed(() => stylex.props(styles.hint))
const triggerSx = computed(() => stylex.props(styles.trigger, focus.ring))
const listSx = computed(() => stylex.props(styles.list))
const itemSx = computed(() => stylex.props(styles.item))
const fileNameSx = computed(() => stylex.props(styles.fileName))
const fileSizeSx = computed(() => stylex.props(styles.fileSize))
const removeSx = computed(() => stylex.props(styles.remove, focus.subtle))

function onReject(rejected: { reasons: readonly string[] }[]) {
  emit(
    'reject',
    rejected.flatMap((entry) => Array.from(entry.reasons)),
  )
}
</script>

<template>
  <FileInput
    v-bind="omitClassStyle($attrs)"
    :value="value"
    :default-value="defaultValue"
    :accept="accept"
    :multiple="multiple"
    :max-files="maxFiles"
    :max-size="maxSize"
    :min-size="minSize"
    :validate="validate"
    :name="name"
    :form="form"
    :required="required"
    :disabled="disabled"
    @reject="onReject"
    :class="[rootSx.className, $attrs.class]"
    :style="[rootSx.style, $attrs.style]"
  >
    <FileInputDropzone v-if="dropzone" :class="dropzoneSx.className" :style="dropzoneSx.style">
      <span :class="hintSx.className" :style="hintSx.style">{{ hint }}</span>
      <FileInputTrigger :class="triggerSx.className" :style="triggerSx.style">
        <NvIcon name="upload" :size="15" />
        {{ triggerLabel }}
      </FileInputTrigger>
    </FileInputDropzone>
    <!-- A trigger-only layout keeps the keyboard path without a drop target. -->
    <FileInputTrigger v-else :class="triggerSx.className" :style="triggerSx.style">
      <NvIcon name="upload" :size="15" />
      {{ triggerLabel }}
    </FileInputTrigger>
    <FileInputList
      v-if="showList"
      :aria-label="listLabel"
      :class="listSx.className"
      :style="listSx.style"
    >
      <FileInputItem v-slot="{ state }" :class="itemSx.className" :style="itemSx.style">
        <NvIcon name="file" :size="14" />
        <span :class="fileNameSx.className" :style="fileNameSx.style">{{ state.file.name }}</span>
        <span :class="fileSizeSx.className" :style="fileSizeSx.style">
          {{ formatFileSize(state.file.size) }}
        </span>
        <FileInputItemRemove :class="removeSx.className" :style="removeSx.style">
          <NvIcon name="close" :size="13" />
        </FileInputItemRemove>
      </FileInputItem>
    </FileInputList>
  </FileInput>
</template>
