#!/usr/bin/env zx

import AppRoot from 'app-root-path'
import Terminal from 'terminal-kit'

/**
 * @link https://github.com/cronvel/terminal-kit/issues/200
 */
const termkit = Terminal.terminal

/**
 * run with kill (! or Ctrl + C)
 */
function rwk(...args) {
  const p = $(...args)
  const onKeyEvent = (key) => {
    if (key === 'CTRL_C' || key === '!') {
      p.kill()
    }
  }
  termkit.addListener('key', onKeyEvent)
  return p.finally(() => termkit.removeListener('key', onKeyEvent))
}

try {
  switch (`${argv._[0]}`.toLowerCase()) {
    case 'up':
      await $`mkdir -p ./data/sql`
      await $`mkdir -p ./data/redis`
      await $`docker compose -f compose.yaml up`
      break

    case 'down':
      await $`docker compose -f compose.yaml down`
      break

    case 'clean':
      await $`rm -rf ./dist/ ./data/sql/data ./data/redis`
      break

    case 'build':
      // clear
      await $`rm -rf ./dist/`

      // build backend-service
      await $`tsc --project ./tsconfig.build.json && tsc-alias -p ./tsconfig.build.json`

      // cp file
      await $`rsync -r ./src/public/ ./dist/public`

      break

    case 'init-mysql':
      // cd root for read .env.dev file
      await $`cd ${AppRoot} && cross-env NODE_ENV=dev TZ=UTC tsx --no-cache ./scripts/init_mysql.ts`
      break

    default:
      console.log(chalk.red(`unsupport argv: ${JSON.stringify(argv)}`))
  }

} catch (p) {
  console.log(p)

} finally {
  process.exit(0)
}
