import { recursive } from '@pnpm/plugin-commands-recursive'
import { preparePackages } from '@pnpm/prepare'
import test = require('tape')
import { DEFAULT_OPTS } from './utils'

test('pnpm recursive rebuild', async (t) => {
  const projects = preparePackages(t, [
    {
      name: 'project-1',
      version: '1.0.0',

      dependencies: {
        'pre-and-postinstall-scripts-example': '*',
      },
    },
    {
      name: 'project-2',
      version: '1.0.0',

      dependencies: {
        'pre-and-postinstall-scripts-example': '*',
      },
    },
  ])

  await recursive.handler(['install'], {
    ...DEFAULT_OPTS,
    dir: process.cwd(),
    ignoreScripts: true,
  })

  await projects['project-1'].hasNot('pre-and-postinstall-scripts-example/generated-by-preinstall.js')
  await projects['project-1'].hasNot('pre-and-postinstall-scripts-example/generated-by-postinstall.js')
  await projects['project-2'].hasNot('pre-and-postinstall-scripts-example/generated-by-preinstall.js')
  await projects['project-2'].hasNot('pre-and-postinstall-scripts-example/generated-by-postinstall.js')

  await recursive.handler(['rebuild'], {
    ...DEFAULT_OPTS,
    dir: process.cwd(),
  })

  await projects['project-1'].has('pre-and-postinstall-scripts-example/generated-by-preinstall.js')
  await projects['project-1'].has('pre-and-postinstall-scripts-example/generated-by-postinstall.js')
  await projects['project-2'].has('pre-and-postinstall-scripts-example/generated-by-preinstall.js')
  await projects['project-2'].has('pre-and-postinstall-scripts-example/generated-by-postinstall.js')
  t.end()
})

test('`pnpm recursive rebuild` specific dependencies', async (t) => {
  const projects = preparePackages(t, [
    {
      name: 'project-1',
      version: '1.0.0',

      dependencies: {
        'install-scripts-example-for-pnpm': 'zkochan/install-scripts-example',
        'pre-and-postinstall-scripts-example': '*',
      },
    },
    {
      name: 'project-2',
      version: '1.0.0',

      dependencies: {
        'install-scripts-example-for-pnpm': 'zkochan/install-scripts-example',
        'pre-and-postinstall-scripts-example': '*',
      },
    },
    {
      name: 'project-3',
      version: '1.0.0',
    },
  ])

  await recursive.handler(['install'], {
    ...DEFAULT_OPTS,
    dir: process.cwd(),
    ignoreScripts: true,
  })

  await projects['project-1'].hasNot('pre-and-postinstall-scripts-example/generated-by-preinstall.js')
  await projects['project-1'].hasNot('pre-and-postinstall-scripts-example/generated-by-postinstall.js')
  await projects['project-2'].hasNot('pre-and-postinstall-scripts-example/generated-by-preinstall.js')
  await projects['project-2'].hasNot('pre-and-postinstall-scripts-example/generated-by-postinstall.js')

  await recursive.handler(['rebuild', 'install-scripts-example-for-pnpm'], {
    ...DEFAULT_OPTS,
    dir: process.cwd(),
  })

  await projects['project-1'].hasNot('pre-and-postinstall-scripts-example/generated-by-preinstall.js')
  await projects['project-1'].hasNot('pre-and-postinstall-scripts-example/generated-by-postinstall.js')
  await projects['project-2'].hasNot('pre-and-postinstall-scripts-example/generated-by-preinstall.js')
  await projects['project-2'].hasNot('pre-and-postinstall-scripts-example/generated-by-postinstall.js')

  {
    const generatedByPreinstall = projects['project-1'].requireModule('install-scripts-example-for-pnpm/generated-by-preinstall')
    t.ok(typeof generatedByPreinstall === 'function', 'generatedByPreinstall() is available')

    const generatedByPostinstall = projects['project-1'].requireModule('install-scripts-example-for-pnpm/generated-by-postinstall')
    t.ok(typeof generatedByPostinstall === 'function', 'generatedByPostinstall() is available')
  }

  {
    const generatedByPreinstall = projects['project-2'].requireModule('install-scripts-example-for-pnpm/generated-by-preinstall')
    t.ok(typeof generatedByPreinstall === 'function', 'generatedByPreinstall() is available')

    const generatedByPostinstall = projects['project-2'].requireModule('install-scripts-example-for-pnpm/generated-by-postinstall')
    t.ok(typeof generatedByPostinstall === 'function', 'generatedByPostinstall() is available')
  }
  t.end()
})
