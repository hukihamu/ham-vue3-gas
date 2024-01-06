const express = require('express')
const fs = require('fs')
const cors = require('cors')
const path = require('path')
const spawn = require('cross-spawn')

childProcess.execSync('webpack --mode development')

const rawText = fs.readFileSync('../dist/gas.js', 'utf8')
let gas = eval(`let globalThis = {};` + rawText + 'globalThis')
fs.watchFile('../dist/gas.js', () => {
  console.info('update:gas.js')
  const rawText = fs.readFileSync('../dist/gas.js', 'utf8')
  gas = eval(`let globalThis = {};` + rawText + 'globalThis')
})
spawn('webpack',['--watch', '--mode', 'development'], {stdio: 'inherit'})
// mock start
// TODO
const SpreadsheetApp = {}
const UrlFetchApp = {}
// mock end
const app = express()
const port = 3001

app.use(express.json());
app.use(cors())

app.post('/:scriptName', async (req, res) => {
  console.log('scriptName', req.params.scriptName)
  console.log('args', req.body)
  const result = await gas[req.params.scriptName](req.body)
  console.log('return', result)
  res.send(result);
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})