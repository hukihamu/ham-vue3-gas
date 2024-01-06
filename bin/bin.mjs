#!/usr/bin/env node

import * as path from 'path'
import fsExtra from 'fs-extra'
import fs from 'fs'
import {fileURLToPath} from 'url'
import {sync} from 'cross-spawn'

console.log('Create ham-vue3-gas')
const rootPath = path.resolve(process.cwd())
const __dirname = path.dirname(fileURLToPath(import.meta.url))
fsExtra.copySync(path.join(__dirname, 'template/.clasp.json'), path.join(rootPath, '.clasp.json'))
const args = process.argv.slice(2)
if (args[0]) {
  // package-name
  const packageName = args[0].trim().replace(/\/+$/g, '')
  const packageJson = fs.readFileSync(path.join(__dirname, 'template/package.json'), 'utf8')
  fs.writeFileSync(path.join(rootPath, 'package.json'), packageJson.replace('ham-vue3-gas-project', packageName))
} else {
  fsExtra.copySync(path.join(__dirname, 'template/package.json'), path.join(rootPath, 'package.json'))
}
fs.writeFileSync(path.join(rootPath, '.gitignore'), '.idea\nnode_modules\n.clasp.json\nfrontend/node_modules\ndist\n')
fsExtra.copySync(path.join(__dirname, 'template/shared'), path.join(rootPath, 'shared'))
fsExtra.copySync(path.join(__dirname, 'template/frontend'), path.join(rootPath, 'frontend'))
fsExtra.copySync(path.join(__dirname, 'template/backend'), path.join(rootPath, 'backend'))
console.log('Successfully created')
console.log('npm install')
sync('npm', ['install'], {stdio: 'inherit'})