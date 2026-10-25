export function collectionRows(source: 'collection' | 'activity') {
  return Array.from({ length: 153 }, (_, i) => ({
    id: `${source}-${String(i + 1).padStart(3, '0')}`,
    reference: `CAT-${Math.floor(i / 2) + 1}`,
    title: source === 'collection' ? `城市记忆馆藏 · ${i + 1}` : `河岸共读 · 第 ${i + 1} 场`,
    count: i === 0 ? 0 : i + 3,
    note: i === 0 ? '' : i === 1 ? '—' : '可在服务台了解详情',
    location: '河畔公共文化空间 · 二层东侧长廊 · 城市记忆专题阅览区',
    status: i % 2 ? '开放预约' : '现场阅览',
    action: '选择',
  }))
}
export const collectionColumns = [
  { key: 'id', label: '公开记录编号' },
  { key: 'reference', label: '参考号' },
  { key: 'title', label: '馆藏／活动名称' },
  { key: 'count', label: '份数／名额', align: 'right' as const },
  { key: 'note', label: '备注（空白即原文为空）', align: 'center' as const },
  { key: 'location', label: '完整位置说明' },
  { key: 'status', label: '安排' },
  { key: 'action', label: '记录操作' },
]
export const eventLabels = {
  time: '时间',
  line: '空间',
  level: '优先级',
  name: '事件',
  wo: '参考号',
  status: '记录状态与事件编号',
}
export function eventRows(replacement = false) {
  return Array.from({ length: replacement ? 2 : 24 }, (_, i) => ({
    id: `${replacement ? 'replacement' : 'event'}-${String(i + 1).padStart(3, '0')}`,
    time: `14:${String(i).padStart(2, '0')}`,
    line: i % 2 ? '河畔展厅' : '街角书房',
    level: i % 2 ? ('gen' as const) : ('sev' as const),
    name:
      i % 2
        ? '活动安排更新：沿着河岸读一座城的公共分享与交流 · 第二场次地点调整至东侧长廊，请保留原预约编号'
        : '预约时间变更',
    wo: i < 2 ? 'REF-7' : `REF-${i + 8}`,
    status: i === 0 ? '已恢复' : i === 1 ? '特别好' : '待阅',
    tone: i === 0 ? 'neutral' : i === 1 ? 'attention' : 'quiet',
  }))
}
