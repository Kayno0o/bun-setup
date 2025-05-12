#!/usr/bin/env bun

import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

// bun init
execSync('bun init -y', { stdio: 'inherit' })

// .vscode/settings.json
mkdirSync('.vscode', { recursive: true })
writeFileSync('.vscode/settings.json', JSON.stringify({
  // Disable the default formatter, use eslint instead
  'prettier.enable': false,
  'editor.formatOnSave': false,

  // Auto fix
  'editor.codeActionsOnSave': {
    'source.fixAll.eslint': 'explicit',
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
