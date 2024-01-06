#!/usr/bin/env node

import {program} from 'commander'
import * as path from 'path'
import * as fs from 'fs-extra'
import {fileURLToPath} from 'url'

program.name('create-ham-vue3-gas').action(
  () => {
    console.log('Create ham-vue3-gas')
    const rootPath = path.resolve(process.cwd())
    fs.copySync(path.join(__dirname, 'template/.clasp.json'), path.join(rootPath, '.clasp.json'))
    fs.copySync(path.join(__dirname, 'template/package.json'), path.join(rootPath, 'package.json'))
    fs.copySync(path.join(__dirname, 'template/shared'), path.join(rootPath, 'shared'))
    fs.copySync(path.join(__dirname, 'template/frontend'), path.join(rootPath, 'frontend'))
    fs.copySync(path.join(__dirname, 'template/backend'), path.join(rootPath, 'backend'))
    console.log('Successfully created')
  }
)
program.parse(process.argv)