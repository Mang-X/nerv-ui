// 原库消费方契约参考，恢复责任 #12–#15；不属于独立库行为测试。
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createSourceFile, isImportDeclaration, isStringLiteral, ScriptTarget } from 'typescript'
import { describe, expect, it } from 'vitest'
import {
  appsRequiringContract,
  CONTRACT_SHELL_BASENAME,
} from '../packages/ui/src/test-support/nvuiImportHygiene'
if (!process.env.NERV_IIP_REFERENCE_ROOT)
  throw new Error(
    'Explicit NERV_IIP_REFERENCE_ROOT required; these are original consumer contracts.',
  )

// Design System v2 tokens live in the shared, single-source-of-truth theme file
// inside @nerv-ui/ui (consumed by ALL apps). Guard the brand-critical values AND
// the ADR 0020 §3/§4 scene-namespace + cascade-layer isolation contract.
const srcDir = resolve(process.env.NERV_IIP_REFERENCE_ROOT!, 'frontend/packages/ui/src')
const read = (rel: string) => readFileSync(resolve(srcDir, rel), 'utf8')

// App main.css files live outside packages/ui: src → ui → packages → frontend.
const appCss = (app: string) => read(`../../../apps/${app}/src/assets/main.css`)
const appEntry = (app: string) => read(`../../../apps/${app}/src/main.ts`)
const firstImportSpecifier = (source: string) => {
  const file = createSourceFile('main.ts', source, ScriptTarget.Latest, true)
  const statement = file.statements[0]
  return statement && isImportDeclaration(statement) && isStringLiteral(statement.moduleSpecifier)
    ? statement.moduleSpecifier.text
    : undefined
}
const HOST_APPS = [
  'business-console',
  'business-pda',
  'console',
  'design-system',
  'screen',
] as const
const LAYER_ORDER =
  '@layer theme, nv-tokens, base, components, nv-components, utilities, nv-overrides, app;'

describe('Nerv-IIP host integration references', () => {
  it('declares the full global layer order first in every host app main.css', () => {
    for (const app of HOST_APPS) {
      const css = appCss(app)
      // First non-comment statement must be the exact layer order.
      const firstStmt = css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .trim()
        .split('\n')[0]
        .trim()
      expect.soft(firstStmt, `${app} main.css first statement`).toBe(LAYER_ORDER)
    }
  })

  it('loads the host layer order before Vue and component-library modules', () => {
    for (const app of HOST_APPS) {
      expect
        .soft(firstImportSpecifier(appEntry(app)), `${app} main.ts first import`)
        .toBe('./assets/main.css')
    }
  })

  it('imports overrides into nv-overrides in product hosts', () => {
    // Product apps import it into nv-overrides.
    for (const app of HOST_APPS) {
      expect.soft(appCss(app)).toMatch(/overrides\.css'\s*layer\(nv-overrides\)/)
    }
  })
})

describe('Nerv-IIP consumer registration references', () => {
  it('derives the four original consumers', () => {
    expect(appsRequiringContract(resolve(srcDir, '../../..'))).toEqual([
      'business-console',
      'business-pda',
      'console',
      'screen',
    ])
  })
  it('keeps the original consumers contract shells byte-identical', () => {
    const contents = appsRequiringContract(resolve(srcDir, '../../..')).map((app) =>
      readFileSync(resolve(srcDir, '../../../apps', app, 'src', CONTRACT_SHELL_BASENAME)).toString(
        'base64',
      ),
    )
    expect(contents).toHaveLength(4)
    expect(new Set(contents).size).toBe(1)
  })
  it('registers the host-provided upload purpose in FileStorage', () => {
    const settings = JSON.parse(
      readFileSync(
        resolve(
          process.env.NERV_IIP_REFERENCE_ROOT!,
          'backend/services/FileStorage/src/Nerv.IIP.FileStorage.Web/appsettings.json',
        ),
        'utf8',
      ),
    )
    expect(Object.keys(settings.FileStorage.PurposePolicies)).toContain('quality-evidence')
  })
})
