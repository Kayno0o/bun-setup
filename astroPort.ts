import { createServer } from 'node:net'
import { text } from '@clack/prompts'
import { numberFromString } from '@kaynooo/utils'

export async function setupPort() {
  function isPortAvailable(port: number) {
    return new Promise((resolve) => {
      const server = createServer()
      server.listen(port, () => {
        server.once('close', () => resolve(true))
        server.close()
      })
      server.on('error', () => resolve(false))
    })
  }

  const devPort = await text({
    message: 'What port should the dev server run on?',
    placeholder: String(numberFromString(process.cwd(), 1000, 10000)),
    defaultValue: String(numberFromString(process.cwd(), 1000, 10000)),
    validate: (value) => {
      const portNum = Number.parseInt(value)
      if (Number.isNaN(portNum))
        return 'Please enter a valid number'
      if (portNum < 1 || portNum > 65535)
        return 'Port must be between 1 and 65535'
      if (portNum < 1024)
        return 'Ports below 1024 require root privileges'
    },
  })

  if (typeof devPort !== 'string' || Number.isNaN(devPort)) {
    console.error(devPort)
    process.exit(2)
  }

  const devPortNumber = Number(devPort)

  const availableDev = await isPortAvailable(devPortNumber)
  if (!availableDev) {
    console.error(`Port ${devPort} is already in use`)
    process.exit(2)
  }

  const prodPort = await text({
    message: 'What port should the production server run on?',
    placeholder: String(devPortNumber + 1),
    defaultValue: String(devPortNumber + 1),
    validate: (value) => {
      const portNum = Number.parseInt(value)
      if (Number.isNaN(portNum))
        return 'Please enter a valid number'
      if (portNum < 1 || portNum > 65535)
        return 'Port must be between 1 and 65535'
      if (portNum < 1024)
        return 'Ports below 1024 require root privileges'
      if (portNum === Number.parseInt(devPort))
        return 'Production port must be different from dev port'
    },
  })

  if (typeof prodPort !== 'string' || Number.isNaN(prodPort)) {
    console.error(prodPort)
    process.exit(2)
  }

  const availableProd = await isPortAvailable(Number(prodPort))
  if (!availableProd) {
    console.error(`Port ${prodPort} is already in use`)
    process.exit(2)
  }

  return { devPort, prodPort }
}
