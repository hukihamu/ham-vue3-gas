import {BaseScriptType} from './share'

export {createGasApp, AsyncScriptType, useProperties}

declare let global: { [name: string]: unknown }

type CreateOptions = {
  htmlFileName?: string
  editHtmlOutput?: (output: GoogleAppsScript.HTML.HtmlOutput) => GoogleAppsScript.HTML.HtmlOutput
  onDoGet?: (htmlOutput: GoogleAppsScript.HTML.HtmlOutput) => void
}
type UseScriptsOptions = {
  onBeforeScript?: (args: any) => void
  onAfterScript?: (returnValue: any) => void
}
type GasAppOptions = {
  /**
   * Script runtime	6 min / execution
   * Simultaneous executions per user	30 / user
   * Simultaneous executions per script	1,000
   */
  useScripts: <T extends AsyncScriptType<BaseScriptType>>(scripts: T, initGlobal: (global: { [K in keyof T]?: WrapperScript<T[K]> }, wrapperScript: <K extends keyof T>(name: Exclude<K, ''>) => WrapperScript<T[K]>) => void, options?: UseScriptsOptions) => GasAppOptions
  useSpreadsheetDB: (initGlobal: (
                       global: { initTables: () => void },
                       initTables: () => void) => void,
                     ...repositoryList: { new(): SSRepository<any> }[]) => GasAppOptions
}

function createGasApp(options: CreateOptions = {}): GasAppOptions {
  global.doGet = () => {
    const gasHtml = HtmlService.createHtmlOutputFromFile(options.htmlFileName ?? 'index')
    const htmlOutput = options.editHtmlOutput
      ? options.editHtmlOutput(gasHtml)
      : gasHtml.addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    if (options.onDoGet) options.onDoGet(htmlOutput)
    return htmlOutput
  }

  return gasAppOptions
}

const gasAppOptions: GasAppOptions = {
  useScripts<T extends AsyncScriptType<BaseScriptType>>(
    scripts: T,
    initGlobal: (global: { [K in keyof T]?: WrapperScript<T[K]> }, wrapperScript: <K extends keyof T>(name: Exclude<K, ''>) => WrapperScript<T[K]>) => void,
    options: UseScriptsOptions = {}) {
    function wrapperScript<K extends keyof T>(name: Exclude<K, ''>): WrapperScript<T[K]> {
      return async (args: any) => {
        if (options.onBeforeScript) options.onBeforeScript(args)
        const returnValue = await scripts[name](args)
        if (options.onAfterScript) options.onAfterScript(returnValue)
        return {json: JSON.stringify(returnValue)}
      }
    }

    initGlobal(global as any, wrapperScript)
    return this
  },
  /**
   * SpreadsheetをDBとして利用する<br>
   * 作成したRepositoryを登録する
   */
  useSpreadsheetDB(initGlobal: (
                     global: { initTables: () => void },
                     initTables: () => void) => void,
                   ...repositoryList: { new(): SSRepository<any> }[]) {
    const initTables = () => {
      for (const repository of repositoryList) {
        try {
          console.info('create instances')
          const r = new repository()
          const name = r['tableName']
          console.info('start', name)
          r.initTable()
          console.info('success', name)
        } catch (e) {
          console.error('init spreadsheet error', e)
        }
      }
    }
    initGlobal(global as any, initTables)
    return this
  },
}
type AsyncScriptType<T extends BaseScriptType> = {
  [K in keyof T]: (args: Parameters<T[K]>[0]) => Promise<ReturnType<T[K]>>
}
type WrapperScript<S extends (args: any) => any> = (args: Parameters<S>[0]) => Promise<{ json: string }>

/**
 * Properties read/write	50,000 / day
 */
function useProperties<K extends string>() {
  return {
    document: {
      getProperties: PropertiesService.getDocumentProperties().getProperties,
      deleteAllProperties: PropertiesService.getDocumentProperties().deleteAllProperties,
      getKeys: PropertiesService.getDocumentProperties().getKeys,
      setProperties: (properties: { K: string }) => {
        return PropertiesService.getDocumentProperties().setProperties(properties)
      },
      getProperty: (key: K) => {
        return PropertiesService.getDocumentProperties().getProperty(key)
      },
      setProperty: (key: K, value: string) => {
        return PropertiesService.getDocumentProperties().setProperty(key, value)
      },
      deleteProperty: (key: K) => {
        PropertiesService.getDocumentProperties().deleteProperty(key)
      },
    },
    script: {
      getProperties: PropertiesService.getScriptProperties().getProperties,
      deleteAllProperties: PropertiesService.getScriptProperties().deleteAllProperties,
      getKeys: PropertiesService.getScriptProperties().getKeys,
      setProperties: (properties: { K: string }) => {
        return PropertiesService.getScriptProperties().setProperties(properties)
      },
      getProperty: (key: K) => {
        return PropertiesService.getScriptProperties().getProperty(key)
      },
      setProperty: (key: K, value: string) => {
        return PropertiesService.getScriptProperties().setProperty(key, value)
      },
      deleteProperty: (key: K) => {
        PropertiesService.getScriptProperties().deleteProperty(key)
      },
    },
    user: {
      getProperties: PropertiesService.getUserProperties().getProperties,
      deleteAllProperties: PropertiesService.getUserProperties().deleteAllProperties,
      getKeys: PropertiesService.getUserProperties().getKeys,
      setProperties: (properties: { K: string }) => {
        return PropertiesService.getUserProperties().setProperties(properties)
      },
      getProperty: (key: K) => {
        return PropertiesService.getUserProperties().getProperty(key)
      },
      setProperty: (key: K, value: string) => {
        return PropertiesService.getUserProperties().setProperty(key, value)
      },
      deleteProperty: (key: K) => {
        PropertiesService.getUserProperties().deleteProperty(key)
      },
    }
  }
}

/*--------------------------------------------------------------------------------------------------------------------*/

type DatabaseQueryParams = {
  // https://developers.notion.com/reference/post-database-query-filter
  filter?: any
  // https://developers.notion.com/reference/post-database-query-sort
  sorts?: any[]
  page_size?: number
}
type PageCreateParams = {
  parent: { page_id: string } | { database_id: string }
  properties: any
  children?: any[] | string
  icon?: any
  cover?: any
}
type PageUpdatePropertiesParams = {
  properties?: any
  archived?: boolean
  icon?: any
  cover?: any
}

export class NotionClient {
  // TODO https://www.notion.so/api/v3/loadPageChunk
// {
//  "pageId": "your-page-id",
//  "limit": 50,
//  "cursor": {
//  "stack": []
//   },
// "chunkNumber": 0,
// "verticalColumns": false
// }
  private readonly _apiBaseUrl = 'https://api.notion.com/v1'
  private readonly _authToken: string
  private readonly _urlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp

  constructor(authToken: string, urlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp) {
    this._authToken = authToken
    this._urlFetchApp = urlFetchApp
  }

  // static createToken(): string{
  // TODO GAS Oauth2を利用する
  //  https://qiita.com/Qnoir/items/98741f6b4266e6960b9d
  //  https://developers.notion.com/reference/create-a-token
  //     return ''
  // }
  private createHeaders() {
    return {
      Authorization: `Bearer ${this._authToken}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    }
  }

  private async fetch(path: string, options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions) {
    const url = this._apiBaseUrl + path
    let resp = this._urlFetchApp.fetch(url, options)
    if (resp.getResponseCode() === 429) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve()
        }, 2000)
      })
      resp = this._urlFetchApp.fetch(url, options)
    }
    if (resp.getResponseCode() === 200) {
      return JSON.parse(resp.getContentText())
    }
    throw resp.getContentText()
  }

  // TODO
  // get blocks() {
  //     return {
  //         append(){},
  //         get(){},
  //         list(){},
  //         update(){},
  //         delete(){},}
  // }

  pages = {
    create: async (body: PageCreateParams) => {
      return this.fetch('/pages', {
        headers: this.createHeaders(),
        method: 'post',
        payload: JSON.stringify(body),
        muteHttpExceptions: true,
      })
    },
    get: async (pageId: string) => {
      return this.fetch(`/pages/${pageId}`, {
        headers: this.createHeaders(),
        method: 'get',
        muteHttpExceptions: true,
      })
    },
    getProperty: async (pageId: string, propertyId: string) => {
      return this.fetch(`/pages/${pageId}/properties/${propertyId}`, {
        headers: this.createHeaders(),
        method: 'get',
        muteHttpExceptions: true,
      })
    },
    updateProperty: async (pageId: string, body: PageUpdatePropertiesParams) => {
      return this.fetch(`/pages/${pageId}`, {
        headers: this.createHeaders(),
        method: 'patch',
        payload: JSON.stringify(body),
        muteHttpExceptions: true,
      })
    },
    // TODO
    // archive() {
    // },
  }

  databases =
    {
      // TODO
      // create() {
      // },
      query: async (databaseId: string, body: DatabaseQueryParams = {}): Promise<any> => {
        let cursor: string | undefined = undefined
        let result: any[] = []
        while (true) {
          const payload = Object.assign(body, {start_cursor: cursor})
          const resp = await this.fetch(`/databases/${databaseId}/query`, {
            headers: this.createHeaders(),
            method: 'post',
            payload: JSON.stringify(payload),
            muteHttpExceptions: true,
          })
          result = result.concat(resp.results)
          if (resp.has_more) {
            cursor = resp.next_cursor
          } else {
            return result
          }
        }
      },
      // TODO
      // get() {
      // },
      // update() {
      // },
      // updateProperty() {
      // },
    }

  // TODO
  // get users() {
  //     return {
  //         get(){},
  //         list(){},
  //         getBot(){},
  //     }
  // }

  // TODO
  // get comments() {
  //     return {
  //         create(){},
  //         get(){},
  //     }
  // }
  // TODO
  // get search() {
  //     return {
  //         searchByTitle(){},
  //     }
  // }
}

/*--------------------------------------------------------------------------------------------------------------------*/
/**
 * SSRepositoryのinitData、columnListの宣言に使用
 */
export type InitEntity<E extends SSEntity> = Omit<E, 'row'>
/**
 * スプレッドシートに格納するデータオブジェクトを定義
 */
export type SSEntity = {
  row: number
}

/**
 * スプレッドシートをテーブルとしてCRUD操作を行う<br>
 * 本abstract classをextendsして作成する<br>
 * extendsしたクラスをgasInit().useSpreadsheetDBに入力すると利用可能となる<br>
 * extendsしたクラスをインスタンス化して利用する
 */
export abstract class SSRepository<E extends SSEntity> {

  private _sheet: GoogleAppsScript.Spreadsheet.Sheet | undefined

  private importSheet(): GoogleAppsScript.Spreadsheet.Sheet | undefined {
    const spreadsheet = this.spreadSheetApp.openById(this.spreadsheetId)
    return spreadsheet.getSheetByName(this.tableName) ?? undefined
  }

  private get sheet(): GoogleAppsScript.Spreadsheet.Sheet {
    if (!this._sheet) {
      this._sheet = this.importSheet()
      if (this._sheet) {
        if (this.checkRequiredUpdate(this._sheet)) {
          throw `not updated Sheet "${this.tableName}" gas editor run "initTables"`
        } else {
          return this._sheet
        }
      }
      throw `not found Sheet "${this.tableName}" gas editor run "initTables"`
    } else {
      return this._sheet
    }
  }

  private static readonly TABLE_VERSION_LABEL = 'ver:'
  private static readonly DELETE_LABEL = 'DELETE'
  private static readonly ROW_FUNCTION = '=row()'

  /**
   * テーブルバージョン<br>
   * 変更を行うと、旧テーブルをバックアップし、新しくテーブル生成を行う<br>
   * columnList、initData、Entity変更時にバージョンを上げる
   * @protected
   */
  protected abstract readonly tableVersion: number
  /**
   * スプレッドシートに保存する際のカラム順を決める
   * @protected
   */
  protected abstract readonly columnOrder: (keyof InitEntity<E>)[]
  /**
   * テーブル作成(アップデート)時、初期にInsertされるデータ
   * @protected
   */
  protected readonly initData: InitEntity<E>[] = []
  /**
   * データ格納に利用するスプレッドシートID(d/{スプレッドシートID}/edit)
   * @protected
   */
  protected abstract readonly spreadsheetId: string
  /**
   * テーブル名(シート名)
   * @protected
   */
  protected abstract readonly tableName: string
  /**
   * SpreadsheetApp(OAuth スコープ回避のため)
   * @protected
   */
  protected abstract readonly spreadSheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp
  /**
   * トランザクションタイプ(LockService参照) default: user
   */
  lockType: LockType = 'user'
  /**
   * トランザクションロック開放を待つ時間(ミリ秒)
   */
  lockWaitMSec: number = 10000

  private checkRequiredUpdate(sheet: GoogleAppsScript.Spreadsheet.Sheet): boolean {
    return sheet.getRange(1, 1, 1, 1).getValue() !== SSRepository.TABLE_VERSION_LABEL + this.tableVersion
  }

  private createTable(sheet: GoogleAppsScript.Spreadsheet.Sheet): void {
    // DataRangeが1行より多い場合、データはあると判断
    if (sheet.getDataRange().getValues().length > 1) {
      const oldVersion = sheet.getRange(1, 1, 1, 1).getValue()
      const oldSheet = sheet.copyTo(this.spreadSheetApp.openById(this.spreadsheetId))
      const oldName = sheet.getName() + ' version:' + oldVersion
      oldSheet.setName(oldName)
      sheet.clear()
    }
    // バージョン情報をセット
    sheet.getRange(1, 1, 1, 1).setValue(SSRepository.TABLE_VERSION_LABEL + this.tableVersion)
    //ヘッダーをセット
    sheet.getRange(1, 2, 1, this.columnOrder.length).setValues([this.columnOrder])
    //初期データをインサート
    for (const e of this.initData) {
      this.insert(e)
    }
  }

  private toStringList(entity: E | InitEntity<E>): string[] {
    const result: string[] = []
    result.push(SSRepository.ROW_FUNCTION)
    for (const key of this.columnOrder) {
      const value = entity[key] ?? ''
      result.push(JSON.stringify(value))
    }
    return result
  }

  private toEntity(stringList: string[]): E {
    const entity: any = {
      row: stringList[0],
    }

    for (let i = 1; i < stringList.length; i++) {
      const key = this.columnOrder[i - 1]
      entity[key] = JSON.parse(stringList[i] ?? '')
    }
    return entity as E
  }

  private getRowRange(rowNumber: number): GoogleAppsScript.Spreadsheet.Range {
    return this.sheet.getRange(rowNumber, 1, 1, this.columnOrder.length + 1)
  }

  useLock<R>(runningInLock: () => R): R {
    if (this.lockType === 'none') return runningInLock()
    const lock = this.lockType === 'user' ? LockService.getUserLock() : LockService.getScriptLock()
    try {
      lock.waitLock(this.lockWaitMSec)
      const result = runningInLock()
      this.spreadSheetApp.flush()
      return result
    } finally {
      lock.releaseLock()
    }
  }

  /**
   * gas console上で動作させるinitTables()で利用される
   */
  initTable(): void {
    // シートがない場合生成する必要がある
    const spreadsheet = this.spreadSheetApp.openById(this.spreadsheetId)
    const sheet = spreadsheet.getSheetByName(this.tableName)
    this._sheet = sheet ? sheet : spreadsheet.insertSheet().setName(this.tableName)

    if (this.checkRequiredUpdate(this._sheet)) {
      this.createTable(this._sheet)
    }
  }

  /**
   * 挿入処理
   * @param entity 挿入するデータ。rowの有無は任意(利用せず、新規rowが付与される)
   * @return 挿入したデータのrow
   */
  insert(entity: E | InitEntity<E>): number {
    let insertRowNumber = -1
    const values = this.sheet.getDataRange().getValues()
    for (let i = 1; i < values.length; i++) {
      if ((values[i] ?? [])[0] === SSRepository.DELETE_LABEL) {
        insertRowNumber = i + 1
        break
      }
    }
    const insertData = this.toStringList(entity)
    if (insertRowNumber === -1) {
      // 最後尾に挿入
      this.sheet.appendRow(insertData)
      return values.length + 1
    } else {
      // 削除行に挿入
      this.getRowRange(insertRowNumber).setValues([insertData])
      return insertRowNumber
    }
  }

  /**
   * 全件取得(フィルターなどはJSで実施)
   */
  getAll(): E[] {
    const lastRow = this.sheet.getLastRow()
    if (lastRow <= 1) {
      // 0件の場合は取得しない
      return []
    }
    const values = this.sheet.getRange(2, 1, this.sheet.getLastRow() - 1, this.columnOrder.length + 1).getValues()
    const entities: E[] = []
    for (const value of values) {
      if (!value[0]) break
      if (value[0] === SSRepository.DELETE_LABEL) continue
      entities.push(this.toEntity(value))
    }
    return entities
  }

  /**
   * １件取得
   * @param row 取得するrow(rowは自動で付与され、不定一意)
   */
  getByRow(row: number): E {
    const stringList = this.getRowRange(row).getValues()[0] ?? []
    return this.toEntity(stringList)
  }

  /**
   * 更新処理(上書きなため、部分変更不可)
   * @param entity 変更するデータ(row 必須)
   */
  update(entity: E): void {
    this.getRowRange(entity.row).setValues([this.toStringList(entity)])
  }

  /**
   * 削除処理
   * @param row 削除するrow(rowは自動で付与され、不定一意)
   */
  delete(row: number): void {
    const range = this.getRowRange(row)
    range.clear()
    const d = new Array(this.columnOrder.length + 1)
    d[0] = SSRepository.DELETE_LABEL
    range.setValues([d])
  }
}

type LockType = 'user' | 'script' | 'none'

/*--------------------------------------------------------------------------------------------------------------------*/

export function spreadsheetCache(spreadsheetId: string,
                                 spreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp,
                                 expirationInSeconds?: number) {
  const spreadsheet = spreadsheetApp.openById(spreadsheetId)
  const tempSheet = spreadsheet.getSheetByName('cache')
  const sheet = tempSheet ? tempSheet : spreadsheet.insertSheet().setName('cache')
  return {
    get(rowNumber: number) {
      const expiration = Number.parseInt(sheet.getRange(rowNumber, 1, 1, 1).getValue(), 10)
      if (!expiration) {
        return null
      }
      if (expirationInSeconds && (Date.now() - expiration) / 1000 > expirationInSeconds) {
        return null
      }
      const table = sheet.getRange(rowNumber, 2, 1, sheet.getLastColumn()).getValues()
      let text = ''
      for (const row of table) {
        for (const col of row) {
          if (col) {
            text += col.toString()
          } else {
            break
          }
        }
      }
      return JSON.parse(text)
    },
    set(rowNumber: number, data: any) {
      // ※1セル50000文字制限のため、余裕を持って45000
      let json = JSON.stringify(data)
      const chunks: any[] = [Date.now()]
      while (json.length > 0) {
        chunks.push(json.substring(0, 45000))
        json = json.substring(45000)
      }
      const range = sheet.getRange(rowNumber, 1, 1, chunks.length)
      range.setValues([chunks])
    },
    clear(rowNumber: number) {
      sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).clear()
    }
  }
}

/*--------------------------------------------------------------------------------------------------------------------*/
/**
 * Dispatches an update event by recording the current timestamp in a specified row
 * within a "cache" sheet of a given spreadsheet.
 * If the "cache" sheet does not exist, it will be created.
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet to update.
 * @param {GoogleAppsScript.Spreadsheet.SpreadsheetApp} spreadsheetApp - The SpreadsheetApp instance to be used.
 * @param {number} updateEventRowNumber - The row number in the "cache" sheet where the timestamp should be updated.
 * @return {void}
 */
export function dispatchUpdateEvent(spreadsheetId: string,
                                 spreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp,
                                    updateEventRowNumber: number) {
  const spreadsheet = spreadsheetApp.openById(spreadsheetId)
  const tempSheet = spreadsheet.getSheetByName('cache')
  const sheet = tempSheet ? tempSheet : spreadsheet.insertSheet().setName('cache')

  const range = sheet.getRange(updateEventRowNumber, 1, 1, 1)
  range.setValue(Date.now())
}

/**
 * Checks for an update event in a specified row of a cache sheet in a spreadsheet.
 * Retries the check with an interval of 10 seconds up to 24 times.
 *
 * @param {string} spreadsheetId - The ID of the spreadsheet to be accessed.
 * @param {GoogleAppsScript.Spreadsheet.SpreadsheetApp} spreadsheetApp - The SpreadsheetApp to be used.
 * @param {number} finalUpdateTimestamp - The final timestamp to compare update events against.
 * @param {number} updateEventRowNumber - The row number where the update event is checked.
 * @return {number | undefined} - Returns the value of the update event if it is greater than the finalUpdateTimestamp; otherwise, returns undefined.
 */
export function checkUpdateEvent(spreadsheetId: string,
                                 spreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp,
                                 finalUpdateTimestamp: number,
                                 updateEventRowNumber: number): number | undefined {
  const spreadsheet = spreadsheetApp.openById(spreadsheetId)
  const tempSheet = spreadsheet.getSheetByName('cache')
  const sheet = tempSheet ? tempSheet : spreadsheet.insertSheet().setName('cache')
  for (let i = 0; i < 24; i++) {
    const range = sheet.getRange(updateEventRowNumber, 1, 1, 1)
    const value = range.getValue()
    if (value > finalUpdateTimestamp) {
      return value
    }
    Utilities.sleep(10000)
  }

  return undefined
}