<script setup lang="ts">
import { computed } from 'vue'
import SnapshotContext from './SnapshotContext.vue'
import {
  legacyShortage,
  numberText,
  type LegacySnapshotShortage,
  type SnapshotShortage,
  type SnapshotSource,
} from './snapshot'
const props = defineProps<{
  shortages?: readonly LegacySnapshotShortage[]
  display?: readonly SnapshotShortage[]
  source?: SnapshotSource
}>()
const rows = computed(() => props.display ?? props.shortages?.map(legacyShortage) ?? [])
</script>

<template>
  <SnapshotContext
    title="物料缺口汇总"
    :source="source"
    :provided="display !== undefined || shortages !== undefined"
  >
    <p v-if="!rows.length" role="status">
      此来源{{ source?.kind === 'snapshot' ? '快照' : '记录' }}未记录缺料；不代表当前准备就绪。
    </p>
    <details v-else class="overflow-x-auto">
      <summary class="cursor-pointer font-medium">
        {{ rows.length }} 项物料 / 批次缺口（展开汇总）
      </summary>
      <table class="mt-3 w-full text-left text-sm">
        <thead class="bg-muted text-muted-foreground">
          <tr>
            <th class="p-2 font-medium">物料 / 批次</th>
            <th class="p-2 text-right font-medium tabular-nums">缺口数量</th>
            <th class="p-2 font-medium">受影响活动</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.id"
            class="border-t border-border"
            :data-shortage-id="row.id"
          >
            <td class="p-2 align-top">
              <p class="font-medium">{{ row.label }}</p>
              <p
                :class="
                  display === undefined && row.batch
                    ? 'font-mono text-xs text-muted-foreground'
                    : 'text-muted-foreground'
                "
              >
                批次 {{ row.batch ?? '—' }}
              </p>
            </td>
            <td class="p-2 text-right align-top tabular-nums">
              {{ numberText(row.quantity) }} {{ row.unit ?? '—' }}
            </td>
            <td class="p-2 align-top">
              <p v-if="row.affected == null">影响项未提供</p>
              <p v-else-if="!row.affected.length">影响项为空</p>
              <details v-else>
                <summary class="cursor-pointer font-medium">
                  {{ row.affected.length }} 项活动（展开查看）
                </summary>
                <ul class="mt-2 grid gap-2">
                  <li v-for="activity in row.affected" :key="activity.id">
                    <p class="font-medium">{{ activity.label }}</p>
                    <p v-if="activity.location || activity.time" class="text-muted-foreground">
                      {{ [activity.location, activity.time].filter(Boolean).join(' · ') }}
                    </p>
                    <p v-if="activity.result">{{ activity.result }}</p>
                  </li>
                </ul>
              </details>
            </td>
          </tr>
        </tbody>
      </table>
    </details>
  </SnapshotContext>
</template>
