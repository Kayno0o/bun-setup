#!/usr/bin/env bun

import type { ExecSyncOptionsWithBufferEncoding } from 'node:child_process'
import { execSync as execSyncFn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { select } from '@clack/prompts'
import { declareLogger } from '@kaynooo/utils'
import { setupPath } from './astroPath'
import { setupPort } from './astroPort'

const log = declareLogger()

function execSync(cmd: string, args?: ExecSyncOptionsWithBufferEncoding) {
  try {
    log('info', cmd)
    execSyncFn(cmd, { stdio: 'pipe', ...args })
  }
  catch (e) {
    console.error(e)
    process.exit(2)
  }
}

const projectType = await select({
  message: 'What type of project is this?',
  options: [
    { value: 'typescript', label: 'TypeScript' },
    { value: 'astro', label: 'Astro' },
  ],
})

const isAstro = projectType === 'astro'
const isTypescript = projectType === 'typescript'

if (isAstro) {
  await setupPath()
  execSync(`bun create astro@latest ./ --template minimal --install --skip-houston --no`)
}

if (isTypescript)
  execSync('bun init -y')

// .vscode/settings.json
mkdirSync('.vscode', { recursive: true })
writeFileSync('.vscode/settings.json', JSON.stringify({
  // Disable the default formatter, use eslint instead
  'prettier.enable': false,
  'editor.formatOnSave': false,

  // Auto fix
  'editor.codeActionsOnSave': {
    'source.fixAll.eslint': 'always',
    'source.organizeImports': 'never',
  },

  // Silent the stylistic rules in you IDE, but still auto fix them
  'eslint.rules.customizations': [
    { rule: 'style/*', severity: 'off', fixable: true },
    { rule: 'format/*', severity: 'off', fixable: true },
    { rule: '*-indent', severity: 'off', fixable: true },
    { rule: '*-spacing', severity: 'off', fixable: true },
    { rule: '*-spaces', severity: 'off', fixable: true },
    { rule: '*-order', severity: 'off', fixable: true },
    { rule: '*-dangle', severity: 'off', fixable: true },
    { rule: '*-newline', severity: 'off', fixable: true },
    { rule: '*quotes', severity: 'off', fixable: true },
    { rule: '*semi', severity: 'off', fixable: true },
  ],

  // Enable eslint for all supported languages
  'eslint.validate': [
    'javascript',
    'javascriptreact',
    'typescript',
    'typescriptreact',
    'vue',
    'html',
    'markdown',
    'json',
    'jsonc',
    'yaml',
    'toml',
    'xml',
    'gql',
    'graphql',
    'astro',
    'svelte',
    'css',
    'less',
    'scss',
    'pcss',
    'tailwindcss',
    'postcss',
    'github-actions-workflow',
  ],

  ...(isAstro
    ? { 'files.associations': {
        '*.embeddedhtml': 'html',
        '*.css': 'tailwindcss',
      } }
    : {}),
}, null, 2))

// eslint.config.js
writeFileSync('eslint.config.js', `import { typescript } from '@kaynooo/eslint'\n\nexport default typescript()\n`)

// deps
execSync('bun add -D eslint @kaynooo/eslint')
execSync('bun add @kaynooo/utils')

if (isAstro) {
// astro tsconfig
  const tsconfig = JSON.parse(readFileSync('tsconfig.json', 'utf-8'))

  tsconfig.compilerOptions ??= {}
  tsconfig.compilerOptions.path ??= {}
  tsconfig.compilerOptions.path['~/*'] = ['./src/*']

  writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2))
}

// add fields to package.json
const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))

pkg.scripts ??= {}
pkg.scripts['lint:fix'] = 'bunx eslint --fix'

if (isAstro) {
  const { devPort, prodPort } = await setupPort()

  pkg.scripts.dev = `bunx --bun astro dev --port ${devPort} --host 127.0.0.1`
  pkg.scripts.build = 'bunx --bun astro check && bunx --bun astro build'
  pkg.scripts.preview = `NODE_ENV=production bunx --bun astro preview --port ${prodPort} --host 127.0.0.1`
  pkg.scripts.astro = 'bunx --bun astro'
}

writeFileSync('package.json', JSON.stringify(pkg, null, 2))

// lint fix
execSync('bun run lint:fix')
