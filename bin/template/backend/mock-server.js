const express = require('express')
const fs = require('fs')
const cors = require('cors')
const path = require('path')
const spawn = require('cross-spawn')
const childProcess = require('child_process')
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest

childProcess.execSync('webpack --mode development')
const isDev = true
// mock start
const mockData = {}
function mockRange(id, name) {
  return {
    ___id___: id,
    ___name___: name,
    ___row___: 1,
    ___column___: 1,
    ___numRows___: 1,
    ___numColumns___: 1,
    getValues() {
      const ss = mockData[this.___id___] ?? {}
      const sheet = ss[this.___name___] ?? []
      return sheet
        .slice(this.___row___ - 1, this.___row___ + this.___numRows___ - 1)
        .map(row => row
          .slice(this.___column___ - 1, this.___column___ + this.___numColumns___ - 1))
    },
    setValues(values) {
      if (!mockData[this.___id___]) mockData[this.___id___] = {[this.___name___]: []}
      if (!mockData[this.___id___][this.___name___]) mockData[this.___id___][this.___name___] = []
      const rows = mockData[this.___id___][this.___name___]
      for (let i = 0; i < this.___numRows___; i++) {
        const row = rows[this.___row___ + i - 1]
        if (row) {
          for (let j = 0; j < this.___numColumns___; j++) {
            row[this.___column___ + j - 1] = values[i][j]
          }
        } else {
          rows[this.___row___ + i - 1] = values[i]
        }
      }
    },
    getValue() {
      const ss = mockData[this.___id___] ?? {}
      const sheet = ss[this.___name___] ?? []
      const row = sheet.slice(this.___row___ - 1, this.___row___ + this.___numRows___ - 1)[0] ?? []
      return row[this.___column___ - 1] ?? ''
    },
    setValue(value) {
      if (!mockData[this.___id___]) mockData[this.___id___] = {[this.___name___]: []}
      if (!mockData[this.___id___][this.___name___]) mockData[this.___id___][this.___name___] = []
      if (!mockData[this.___id___][this.___name___][this.___row___ - 1]) mockData[this.___id___][this.___name___][this.___row___ - 1] = []
      mockData[this.___id___][this.___name___][this.___row___ - 1][this.___column___ - 1] = value
    },
    clear() {
      const rows = mockData[this.___id___][this.___name___]
      for (let i = 0; i < this.___numRows___; i++) {
        const row = rows[this.___row___ + i - 1]
        if (row) {
          for (let j = 0; j < this.___numColumns___; j++) {
            row[this.___column___ + j - 1] = ''
          }
        }
      }
    }
  }
}
function mockSheet(id){
  return {
    ___id___: id,
    ___name___: 'sheet',
    getRange(row, column, numRows = 1, numColumns = 1) {
      const range = mockRange(this.___id___, this.___name___)
      range.___row___ = row
      range.___column___ = column
      range.___numRows___ = numRows
      range.___numColumns___ = numColumns
      return range
    },
    getDataRange() {
      const range = mockRange(this.___id___, this.___name___)
      range.___numRows___ = mockData[this.___id___][this.___name___].length
      range.___numColumns___ = mockData[this.___id___][this.___name___].reduce((max, row) => Math.max(max, row.length), 0)
      return range
    },
    getName() {
      return this.___name___
    },
    setName(name) {
      this.___name___ = name
    },
    clear() {
      mockData[this.___id___][this.___name___] = []
    },
    copyTo(spreadsheet) {
      mockData[spreadsheet.___id___][this.___name___] = JSON.parse(JSON.stringify(mockData[this.___id___][this.___name___]))
    },
    appendRow(rowContents) {
      mockData[this.___id___][this.___name___].push(rowContents)
    },
    getLastRow() {
      return mockData[this.___id___][this.___name___].length
    },
    getLastColumn() {
      return mockData[this.___id___][this.___name___].reduce((max, row) => Math.max(max, row.length), 0)
    }
  }
}
function mockSpreadsheet() {
  return {
    ___id___: 'spreadsheet',
    getSheetByName(name) {
      const sheet = mockSheet(this.___id___)
      sheet.setName(name)
      return sheet
    },
    insertSheet() {
      return mockSheet(this.___id___)
    }
  }
}
const SpreadsheetApp = {
  getActiveSpreadsheet() {
    return mockSpreadsheet()
  },
  openById(id) {
    const spreadsheet = mockSpreadsheet()
    spreadsheet.___id___ = id
    return spreadsheet
  },
  openByUrl(url) {
    return mockSpreadsheet()
  },
  flush() {}
}
const UrlFetchApp = {
  fetch(url, options = {}) {
    const xhr = new XMLHttpRequest()
    xhr.open(options.method ?? 'GET', url, false)
    for (const key of Object.keys(options.headers ?? {})) {
      xhr.setRequestHeader(key, options.headers[key])
    }
    xhr.setRequestHeader('Content-Type', options.contentType ?? 'application/json')
    xhr.send(options.payload)
    return {
      getResponseCode: () => xhr.status,
      getContentText: () => xhr.responseText,
      getBlob: () => xhr,// TODO
      getAs: () => xhr,// TODO
      getContent: () => xhr,// TODO
      getHeaders: () => xhr.getAllResponseHeaders(),// TODO
      getAllHeaders: () => xhr.getAllResponseHeaders(),
    }
  }
}
const ScriptApp = {
  getService() {
    return {
      getUrl() {
        return 'http://localhost:3001#' + isDev ? 'dev' : 'exec'
      }
    }
  }
}
global.SpreadsheetApp = SpreadsheetApp
global.UrlFetchApp = UrlFetchApp
// mock end


const rawText = fs.readFileSync('../dist/gas.js', 'utf8')
let gas = eval(`let globalThis = {};` + rawText + 'globalThis')
fs.watchFile('../dist/gas.js', () => {
  console.info('update:gas.js')
  const rawText = fs.readFileSync('../dist/gas.js', 'utf8')
  gas = eval(`let globalThis = {};` + rawText + 'globalThis')
})
const wp = spawn('webpack',['--watch', '--mode', 'development'], {stdio: 'inherit'})
wp.on('error', (error) => {
  console.error('build error:', error);
})
const app = express()
const port = 3001

app.use(express.json());
app.use(cors())

app.post('/:scriptName', async (req, res) => {
  try {
    console.log('run script:', req.params.scriptName)
    const result = await gas[req.params.scriptName](req.body)
    res.send(result);
  } catch (e) {
    console.error('gas runtime error', e)
    res.status(500).send({message: 'gas error'});
  }
})
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
})