import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { confirm, text } from '@clack/prompts'

export async function setupPath() {
  const setupPath = await text({
    message: 'Where do you want to set up your project?',
    placeholder: './my-project',
    defaultValue: '.',
    validate: (value) => {
      if (!value)
        return 'Please enter a path'

      const fullPath = resolve(value)
      if (existsSync(fullPath)) {
        const isEmpty = readdirSync(fullPath).length === 0
        if (!isEmpty) {
          return 'Directory is not empty. Choose an empty directory or a new path.'
        }
      }
    },
  })

  if (typeof setupPath === 'symbol') {
    console.error(setupPath)
    process.exit(2)
  }

  if (setupPath !== '.' && !existsSync(setupPath)) {
    const shouldCreate = await confirm({
      message: `Directory "${setupPath}" doesn't exist. Create it?`,
      initialValue: true,
    })

    if (!shouldCreate) {
      process.exit(0)
    }
  }

  if (setupPath !== '.') {
    mkdirSync(setupPath, { recursive: true })
    process.chdir(setupPath)
  }

  return resolve(setupPath)
}
