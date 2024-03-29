import { cdk, javascript, JsonFile } from 'projen'
import { NpmAccess, TrailingComma } from 'projen/lib/javascript'
import { MIN_NODE_VERSION } from './src/constants'

const project = new cdk.JsiiProject({
  name: 'jscli',
  author: 'Bogdan Frankovskyi',
  authorAddress: 'bfrankovskyi@gmail.com',
  stability: 'experimental',
  description: 'Projen External Project for command-arg-parse based JS CLI projects',
  keywords: ['CLI', 'projen'],
  majorVersion: 1,
  packageName: '@bfrankovskyi/jscli',
  repositoryUrl: 'https://github.com/Ferroman/jscli.git',

  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.3.0',
  minNodeVersion: MIN_NODE_VERSION,
  packageManager: javascript.NodePackageManager.NPM,
  projenrcTs: true,
  github: true,
  githubOptions: {
    workflows: false,
  },
  release: false,
  autoMerge: false,
  gitignore: ['.DS_Store', '.npm/'],
  npmAccess: NpmAccess.PUBLIC,
  prettier: true,
  prettierOptions: {
    settings: {
      printWidth: 100,
      semi: false,
      singleQuote: true,
      trailingComma: TrailingComma.ALL,
    },
  },
  tsconfig: {
    compilerOptions: {
      esModuleInterop: true,
      lib: ['es2021'],
      target: 'es2021',
    },
  },
  deps: ['projen'],
  bundledDeps: ['directory-tree', 'eta', 'fs-extra', 'js-yaml'],
  peerDeps: ['projen'],
  devDeps: [
    '@semantic-release/exec',
    '@semantic-release/git',
    '@semantic-release/github@9.2.6',
    '@semantic-release/npm',
    'semantic-release@21.1.2',
    '@types/js-yaml',
  ],
  scripts: {
    'semantic-release': 'semantic-release',
    lint: 'npm run eslint',
    'lint-ci':
      'eslint --ext .ts,.tsx --no-error-on-unmatched-pattern src test build-tools projenrc .projenrc.ts',
    'test:unit':
      'jest test/unit/*.*.test.ts --passWithNoTests --updateSnapshot --coverage --coverageDirectory=coverage/unit',
    'test:integration':
      'jest test/integration/*.*.test.ts --passWithNoTests --updateSnapshot --coverage --coverageDirectory=coverage/integration',
  },
})

project.packageTask.reset()
project.packageTask.exec('npx projen package-all')
project.addPackageIgnore('.npm/')
project.preCompileTask.exec('rm -rf ./lib')
project.compileTask.exec('cp -rf ./src/templates ./lib/templates')

new JsonFile(project, '.releaserc.json', {
  obj: {
    branches: ['main'],
    plugins: [
      '@semantic-release/commit-analyzer',
      '@semantic-release/release-notes-generator',
      '@semantic-release/github',
      '@semantic-release/npm',
      [
        '@semantic-release/git',
        {
          // see: https://github.com/semantic-release/git/issues/280
          assets: [],
          message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
        },
      ],
      [
        '@semantic-release/exec',
        {
          successCmd: 'echo RELEASE_TAG=v${nextRelease.version} > build.env',
        },
      ],
    ],
  },
})

project.synth()
