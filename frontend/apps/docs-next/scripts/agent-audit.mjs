#!/usr/bin/env node
/**
 * 代理桥体检：不用截图，直接把文档站的每个组件页"读"一遍。
 *
 * ui-sdk 的桥认得所有建立在原语之上的组件，`agent.snapshot()` 给出
 * `{ component, label, actions, value }`。所以「这个组件代理能不能用」可以被
 * 断言，而不是靠肉眼看图：
 *
 *   1. 每个活着的条目都有 label —— 没名字的控件代理找不到（错误）
 *   2. 同类同名的条目不会撞名 —— 撞名时按名字定位会有歧义（警告）
 *   3. 页面里的主组件确实登记进了桥 —— 漏登记说明该组件没走 ui-sdk 原语（错误）
 *
 * 只依赖 Chrome 的 DevTools 协议和 Node 自带的 WebSocket，不装 Playwright。
 *
 *   node scripts/agent-audit.mjs                 # 桌面端全部页面
 *   node scripts/agent-audit.mjs --section pad
 *   node scripts/agent-audit.mjs --page carousel --verbose
 *   node scripts/agent-audit.mjs --json
 */
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const docsRoot = join(here, '..')

const CHROME =
  process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

/**
 * 每个页面的主组件在桥里叫什么。默认就是文件名（`carousel` → `carousel`），
 * 只有对不上时才写在这里：
 *
 * - `null`：纯展示件，没有交互也没有动作，不进桥是正常的。
 * - 字符串数组：页面的主组件可能登记成别的名字（或一页多个）。
 */
const EXPECTED = {
  sheet: ['drawer'],
  'date-range-picker': ['date-picker'],
  'time-picker': ['time-input'],
  'file-preview': null,
  'data-table': null,
  chart: null,
  descriptions: null,
  badge: null,
  card: null,
  empty: null,
  skeleton: null,
  spinner: null,
  separator: null,
  breadcrumb: null,
  // 移动端：分隔线、骨架屏没有交互。
  'mobile-divider': null,
  'mobile-skeleton': null,
  // 图片、触底加载、虚拟列表都没有 ui-sdk 原语承载的控件：图片加载是浏览器事件，
  // 另外两个是滚动容器。它们的滚动行为由组件自己观察，页面上没有可登记的条目。
  'mobile-image': null,
  'mobile-infinite-list': null,
  'mobile-virtual-list': null,
  // 触屏端：指标块、工位条、徽标都是展示件。
  'stat-tile': null,
  'station-bar': null,
  'touch-badge': null,
  // 大屏：看板件绝大多数是纯展示，唯一的交互是页面自身的筛选，不在组件里。
  'alarm-table': null,
  'digital-flop': null,
  'kpi-bar': null,
  'ring-gauge': null,
  'screen-bar-chart': null,
  'screen-header': null,
  'screen-panel': null,
  'screen-pareto': null,
  'screen-scaler': null,
  'screen-scroll-area': null,
  'screen-stage-flow': null,
  'screen-stats': null,
  'screen-status-card': null,
  'screen-status-light': null,
  'screen-status-tag': null,
  'screen-summary-card': null,
  'screen-table': null,
  'screen-trend-chart': null,
  // 本批新增的大屏件里，只有 switch / search 建立在 ui-sdk 控件原语上、会自己进桥；
  // 其余是纯展示（分隔线、外框、标题、胶囊条、环图、折线、新鲜度、指标卡、滚动榜）。
  // detail-dialog 的文档示例默认关闭，页面上没有活着的条目——它的桥登记由
  // screen 包的组件级契约测试覆盖，而不是靠页面。
  'screen-glow-divider': null,
  'screen-title-bar': null,
  'screen-border-panel': null,
  'screen-tech-frame': null,
  'screen-capsule-bar': null,
  'screen-donut': null,
  'screen-sparkline': null,
  'screen-freshness': null,
  'screen-parameter': null,
  'screen-scroll-board': null,
  'screen-detail-dialog': null,
}

/**
 * 已知缺口：体检能看见它没登记，但暂时不当作回归——每一条都要有去向，
 * 不能变成"永远红的格子"。修好了就从这里删掉。
 *
 * 现在是空的：sidebar 换了自建的 `sidebar` 原语，timeline 接了
 * `@ui-sdk/vue/timeline`，两个曾经的缺口都补上了。空表是有意的——它让
 * "主组件没进桥"重新变回硬错误。
 */
const KNOWN_GAPS = {}

// ---------------------------------------------------------------- 参数

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const option = (name, fallback) => {
  const at = argv.indexOf(`--${name}`)
  return at >= 0 && argv[at + 1] ? argv[at + 1] : fallback
}

const section = option('section', 'desktop')
const only = option('page', null)
const base = option('base', process.env.DOCS_URL ?? 'http://127.0.0.1:5280')
const asJson = flag('json')
const verbose = flag('verbose')
const strict = !flag('no-strict')

// ---------------------------------------------------------------- 页面清单

async function pages() {
  const dir = join(docsRoot, section)
  const files = await readdir(dir).catch(() => {
    throw new Error(`找不到分区目录：${dir}`)
  })
  return files
    .filter((name) => name.endsWith('.md') && name !== 'index.md')
    .map((name) => name.slice(0, -'.md'.length))
    .filter((slug) => !only || slug === only)
    .sort()
}

// ---------------------------------------------------------------- 浏览器

async function launch() {
  const profile = await mkdtemp(join(tmpdir(), 'nv-agent-audit-'))
  const child = spawn(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--remote-debugging-port=0',
      `--user-data-dir=${profile}`,
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  const portFile = join(profile, 'DevToolsActivePort')
  let port
  for (let i = 0; i < 200; i++) {
    if (existsSync(portFile)) {
      port = (await readFile(portFile, 'utf8')).split('\n')[0].trim()
      if (port) break
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  if (!port) {
    child.kill()
    throw new Error('Chrome 没有写出 DevToolsActivePort')
  }

  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
  const page = targets.find((target) => target.type === 'page')
  if (!page) throw new Error('找不到可用的页面 target')

  const client = await connect(page.webSocketDebuggerUrl)
  return {
    client,
    async close() {
      client.close()
      const exited = new Promise((resolve) => child.once('exit', resolve))
      child.kill()
      await exited
      // Chrome 收尾时还在往 profile 里写，删不掉不算失败——那是临时目录。
      await rm(profile, { recursive: true, force: true, maxRetries: 5 }).catch(() => {})
    },
  }
}

/** 够用的 CDP 客户端：一个连接、id 请求、以及导航用的几个事件。 */
async function connect(url) {
  const ws = new WebSocket(url)
  await new Promise((resolve, reject) => {
    ws.onopen = resolve
    ws.onerror = () => reject(new Error(`连不上 ${url}`))
  })

  let nextId = 0
  const pending = new Map()
  const listeners = new Map()

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (message.id) {
      const entry = pending.get(message.id)
      if (!entry) return
      pending.delete(message.id)
      if (message.error) entry.reject(new Error(JSON.stringify(message.error)))
      else entry.resolve(message.result)
      return
    }
    for (const listener of listeners.get(message.method) ?? []) listener(message.params)
  }

  const once = (method) =>
    new Promise((resolve) => {
      const set = listeners.get(method) ?? new Set()
      const listener = (params) => {
        set.delete(listener)
        resolve(params)
      }
      set.add(listener)
      listeners.set(method, set)
    })

  return {
    send(method, params = {}) {
      const id = ++nextId
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject })
        ws.send(JSON.stringify({ id, method, params }))
      })
    },
    once,
    close: () => ws.close(),
  }
}

async function open(client, url) {
  await client.send('Page.enable')
  const loaded = client.once('Page.loadEventFired')
  await client.send('Page.navigate', { url })
  await loaded
}

async function evaluate(client, expression) {
  const { result, exceptionDetails } = await client.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? '求值失败')
  return result.value
}

/** 在页面里等桥就绪并采样，返回一份纯数据。 */
const PROBE = `(async () => {
  const waitFor = async () => {
    for (let i = 0; i < 200; i++) {
      if (window.__nvAgent) return window.__nvAgent
      await new Promise((r) => setTimeout(r, 50))
    }
    return null
  }
  const agent = await waitFor()
  if (!agent) return { bridge: false }
  // 组件在挂载过程中陆续登记：等条目数连续三次不变再采样，避免读到半张表。
  let last = -1
  for (let i = 0, steady = 0; i < 60 && steady < 3; i++) {
    await new Promise((r) => setTimeout(r, 100))
    const count = agent.snapshot().length
    steady = count === last ? steady + 1 : 0
    last = count
  }
  const live = agent.snapshot().filter((entry) => !entry.offPage)
  const counts = new Map()
  for (const entry of live) {
    const key = entry.component + '\\u0000' + (entry.label ?? '')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return {
    bridge: true,
    total: live.length,
    kinds: [...new Set(live.map((entry) => entry.component))].sort(),
    unnamed: live.filter((entry) => !entry.label).map((entry) => entry.component),
    duplicates: [...counts]
      .filter(([, count]) => count > 1)
      .map(([key, count]) => {
        const [component, label] = key.split('\\u0000')
        return { component, label, count }
      })
      .sort((a, b) => a.component.localeCompare(b.component)),
    entries: live.map((entry) => ({
      component: entry.component,
      label: entry.label ?? '',
      actions: entry.actions ?? [],
    })),
  }
})()`

// ---------------------------------------------------------------- 主流程

const browser = await launch()
const rows = []
try {
  // 先量一次分区首页：顶栏主题按钮、侧栏折叠这类「文档壳」的条目每页都有，
  // 减掉它们之后剩下的才是这个页面自己的组件。
  await open(browser.client, `${base}/${section}/`)
  const index = await evaluate(browser.client, PROBE)
  const shell = new Set(
    (index.entries ?? []).map((entry) => `${entry.component}\u0000${entry.label}`),
  )

  for (const slug of await pages()) {
    const url = `${base}/${section}/${slug}.html`
    try {
      await open(browser.client, url)
      const probe = await evaluate(browser.client, PROBE)
      if (!probe.bridge) {
        rows.push({ slug, url, error: '页面上没有代理桥（window.__nvAgent）' })
        continue
      }
      const own = probe.entries.filter(
        (entry) => !shell.has(`${entry.component}\u0000${entry.label}`),
      )
      const curated = slug in EXPECTED
      const expected = curated ? EXPECTED[slug] : null
      const missing = curated
        ? expected === null
          ? []
          : expected.filter((kind) => !probe.kinds.includes(kind))
        : own.length
          ? []
          : ['（本页没有登记任何组件）']
      rows.push({ slug, url, ...probe, own: own.length, curated, expected, missing })
    } catch (error) {
      rows.push({ slug, url, error: error.message })
    }
  }
} finally {
  await browser.close()
}

// ---------------------------------------------------------------- 输出

const failed = (row) =>
  !!row.error ||
  row.unnamed.length > 0 ||
  (strict && row.missing.length > 0 && !(row.slug in KNOWN_GAPS))

if (asJson) {
  const summary = {
    section,
    pages: rows.length,
    entries: rows.reduce((sum, row) => sum + (row.total ?? 0), 0),
    unnamed: rows.reduce((sum, row) => sum + (row.unnamed?.length ?? 0), 0),
    missing: rows.reduce((sum, row) => sum + (row.missing?.length ?? 0), 0),
    duplicates: rows.reduce((sum, row) => sum + (row.duplicates?.length ?? 0), 0),
  }
  console.log(JSON.stringify({ summary, rows }, null, 2))
} else {
  const pad = (text, width) => String(text).padEnd(width)
  console.log(
    `${pad('页面', 22)}${pad('条目', 6)}${pad('未命名', 8)}${pad('撞名', 6)}${pad('主组件', 12)}说明`,
  )
  for (const row of rows) {
    if (row.error) {
      console.log(
        `${pad(row.slug, 22)}${pad('-', 6)}${pad('-', 8)}${pad('-', 6)}${pad('-', 12)}✗ ${row.error}`,
      )
      continue
    }
    const gap = row.slug in KNOWN_GAPS
    const mark = gap ? '△ 已知缺口' : row.missing.length ? '✗ 未登记' : '✓'
    const component = row.curated
      ? row.expected === null
        ? '—'
        : row.expected.join(',')
      : `（自动）${row.own}`
    const note = gap
      ? `${mark} ${KNOWN_GAPS[row.slug]}`
      : row.missing.length
        ? `${mark} ${row.missing.join(', ')}`
        : row.curated && row.expected === null
          ? `${mark} 展示件`
          : mark
    console.log(
      `${pad(row.slug, 22)}${pad(row.total, 6)}${pad(row.unnamed.length, 8)}${pad(row.duplicates.length, 6)}${pad(component, 12)}${note}`,
    )
    if (verbose) {
      for (const entry of row.entries) {
        console.log(
          `    ${pad(entry.component, 18)}${entry.label || '（无名称）'}  [${entry.actions.join(', ')}]`,
        )
      }
      for (const duplicate of row.duplicates) {
        console.log(`    ! ${duplicate.component} "${duplicate.label}" 出现 ${duplicate.count} 次`)
      }
    }
  }

  const bad = rows.filter(failed)
  console.log(
    `\n${rows.length} 个页面，${bad.length} 个有问题；共 ${rows.reduce((sum, row) => sum + (row.total ?? 0), 0)} 个条目。`,
  )
  if (bad.length) {
    console.log('未命名的控件代理找不到；主组件未登记说明它没走 ui-sdk 原语，或名字对不上。')
  }
}

process.exit(rows.some(failed) ? 1 : 0)
