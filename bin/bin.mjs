
import * as path from 'path'
import * as fs from 'fs-extra'
import {fileURLToPath} from 'node:url'

const cwd = process.cwd()
const argTargetDir = formatTargetDir(process.argv[0])
const defaultTargetDir = 'ham-vue3-gas-project'
const targetDir = argTargetDir || defaultTargetDir
const root = path.join(cwd, targetDir)

const templateDir = path.resolve(
  fileURLToPath(import.meta.url),
  '../..',
  `template`,
)

fs.copySync(path.join(templateDir, '.clasp.json'), path.join(root, '.clasp.json'))
fs.copySync(path.join(templateDir, 'package.json'), path.join(root, 'package.json'))
fs.copySync(path.join(templateDir, 'shared'), path.join(root, 'shared'))
fs.copySync(path.join(templateDir, 'frontend'), path.join(root, 'frontend'))
fs.copySync(path.join(templateDir, 'backend'), path.join(root, 'backend'))


function formatTargetDir(targetDir) {
      return targetDir?.trim().replace(/\/+$/g, '')
}