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
let isGithubPages = false
const matchGithubPages = ['--github-pages', '-gp']
const args = process.argv.slice(2).filter(it => {
  if (matchGithubPages.includes(it)) {
    isGithubPages = true
    return false
  }
  return true
})


if (args[0]) {
  // package-name
  const packageName = args[0].trim().replace(/\/+$/g, '')
  const packageJson = fs.readFileSync(path.join(__dirname, 'template/package.json'), 'utf8')
  fs.writeFileSync(path.join(rootPath, 'package.json'), packageJson.replace('ham-vue3-gas-project', packageName))
} else {
  fsExtra.copySync(path.join(__dirname, 'template/package.json'), path.join(rootPath, 'package.json'))
}
fs.writeFileSync(path.join(rootPath, '.gitignore'), `
/.idea
/node_modules
.clasp.json
/dist

/backend/.env
/frontend/.env
/frontend/node_modules
/shared/dist
`)
fsExtra.copySync(path.join(__dirname, 'template/shared'), path.join(rootPath, 'shared'))
fsExtra.copySync(path.join(__dirname, 'template/frontend'), path.join(rootPath, 'frontend'))
fsExtra.copySync(path.join(__dirname, 'template/backend'), path.join(rootPath, 'backend'))
if (isGithubPages) {
  fsExtra.copySync(path.join(__dirname, 'template/docs'), path.join(rootPath, 'docs'))
}
console.log('Successfully created')
console.log('npm install')
sync('npm', ['install'], {stdio: 'inherit'})