import { javascript } from 'projen'
import { BootstrapComponent } from './components/bootstrap-component'
import { GenContext } from './components/contexts'
import { MIN_NODE_VERSION } from './constants'

export interface JSCLIAppOptions extends javascript.NodeProjectOptions {
  readonly releaserc?: { [name: string]: any }

  /**
   * files settings in package.json
   */
  readonly files?: string[]
}

function bootstrapping(options: any): boolean {
  return '__new__' in options
}

function updateProjenNewArgs(options: any): any {
  // skip for the existing projects
  if (!bootstrapping(options)) {
    return options
  }
  return {
    ...options,
    __new__: {
      ...options.__new__,
      args: {
        ...options.__new__.args,
        packageName: `@bfrankovskyi/${options.name}`,
        deps: [],
      },
    },
  }
}

function updateProjenTasks(project: javascript.NodeProject) {
  // Removed "default" step from build to make @semantic-release/npm publish work
  const build = project.removeTask('build')
  if (build) {
    project.addTask(build.name, {
      description: build.description,
      steps: [
        {
          spawn: 'pre-compile',
        },
        {
          spawn: 'compile',
        },
        {
          spawn: 'post-compile',
        },
        {
          spawn: 'test',
        },
        {
          spawn: 'package',
        },
      ],
    })
    build.lock()
  }

  project.compileTask.reset('shx rm -rf dist')

  project.addTask('dev', {
    exec: './bin/dev',
  })

  project.addTask('build:binary', {
    exec: `npm run remove:dist && nexe bin/run --build -o ${project.name}`,
  })

  project.addTask('lint', {
    exec: 'eslint . src/*.js src/**/*.js',
  })

  project.addTask('lint:fix', {
    exec: 'eslint src/*.js src/**/*.js test/**/*.js --fix',
  })

  project.addTask('semantic-release', {
    exec: 'semantic-release',
  })

  project.addTask('posttest', {
    exec: 'npm run lint',
  })

  project.addTask('prepack', {
    exec: 'npm run build',
  })

  project.testTask.reset('mocha --forbid-only "test/**/*.test.js"')

  project.addTask('remove:dist', {
    exec: 'shx rm -rf dist',
  })
}

export class JSCLIApp extends javascript.NodeProject {
  constructor(options: JSCLIAppOptions) {
    super({
      ...updateProjenNewArgs(options),
      packageManager: javascript.NodePackageManager.NPM,
      minNodeVersion: MIN_NODE_VERSION,
      defaultReleaseBranch: 'main',
      projenrcJsOptions: {
        filename: '.projenrc.cjs', // keep projenrc CommonJS since it does not support ES
      },
      name: options.name,
      github: true,
      release: false,
      autoMerge: false,
      sampleCode: false,
      repository: options.repository,
      authorName: options.authorName,
      authorEmail: options.authorEmail,
      readme: { filename: '' }, // workaround to disable generation of readme file
      jest: false,
      eslint: false,
      package: false,
      entrypoint: 'dist/index.js',
      deps: [
        ...(options.deps || []),
        'fast-safe-stringify',
        'winston',
        'command-line-args',
        'command-line-usage',
        'colors',
      ],
      devDeps: [
        ...(options.devDeps || []),
        '@semantic-release/changelog',
        '@semantic-release/exec',
        '@semantic-release/git',
        '@semantic-release/github',
        'chai',
        'eslint-plugin-import',
        'eslint-plugin-security',
        'eslint',
        'mocha',
        'semantic-release',
        'shx',
        'nexe',
        'convict',
      ],
      gitignore: [...(options.gitignore || []), ''],
      autoDetectBin: false,
      bin: options.bin || {
        [options.name]: './bin/run',
      },
    })
    this.package.addField('type', 'module') // generate ES module
    this.package.addField('files', options.files || ['/bin', '/dist', '/npm-shrinkwrap.json', ''])
    const genContext: GenContext = {
      ...options,
      name: options.name,
      templateName: 'cli',
      description: options.description ?? 'TBD',
      releaserc: JSON.stringify(options.releaserc),
    }

    updateProjenTasks(this)
    new BootstrapComponent(this, genContext)
  }
}
