#!/usr/bin/env bun

import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

// bun init
execSync('bun init -y', { stdio: 'inherit' })

// .vscode/settings.json
mkdirSync('.vscode', { recursive: true })
writeFileSync('.vscode/settings.json', JSON.stringify({
  'eslint.useFlatConfig': true,
  'prettier.enable': false,
  'editor.formatOnSave': false,
  'editor.codeActionsOnSave': {
    'source.fixAll.eslint': 'always',
    'source.organizeImports': 'never',
  },
  'eslint.rules.customizations': [
    { rule: 'style/*', severity: 'off' },
    { rule: 'format/*', severity: 'off' },
    { rule: '*-indent', severity: 'off' },
    { rule: '*-spacing', severity: 'off' },
    { rule: '*-spaces', severity: 'off' },
    { rule: '*-order', severity: 'off' },
    { rule: '*-dangle', severity: 'off' },
    { rule: '*-newline', severity: 'off' },
    { rule: '*quotes', severity: 'off' },
    { rule: '*semi', severity: 'off' },
  ],
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
    'css',
    'tailwindcss',
    'xml',
    'gql',
    'graphql',
    'astro',
    'less',
    'scss',
    'pcss',
    'postcss',
    'github-actions-workflow',
  ],
}, null, 2))

// eslint.config.js
writeFileSync('eslint.config.js', `import { typescript } from '@kaynooo/eslint'\n\nexport default typescript()\n`)

// deps
execSync('bun add -D eslint @kaynooo/eslint', { stdio: 'inherit' })
execSync('bun add @kaynooo/utils', { stdio: 'inherit' })

// add fields to package.json
const pkg = JSON.parse(readFileSync('package.json', 'utf-8'))
pkg.scripts ??= {}
pkg.scripts['lint:fix'] = 'bunx --bun eslint --fix'
writeFileSync('package.json', JSON.stringify(pkg, null, 2))

// lint fix
execSync('bun run lint:fix', { stdio: 'inherit' })
