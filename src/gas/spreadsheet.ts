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
    private importSheet(): GoogleAppsScript.Spreadsheet.Sheet | undefined{
        const spreadsheet = this.spreadSheetApp.openById(this.spreadsheetId)
        return spreadsheet.getSheetByName(this.tableName) ?? undefined
    }

    private get sheet(): GoogleAppsScript.Spreadsheet.Sheet{
        if (!this._sheet) {
            this._sheet = this.importSheet()
            if (this._sheet) {
                if (this.checkRequiredUpdate(this._sheet)){
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

    private onLock<R>(runningInLock: () => R): R {
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
        return this.onLock(() => {
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
        })
    }

    /**
     * 全件取得(フィルターなどはJSで実施)
     */
    getAll(): E[] {
        let values: any[][]
        values = this.onLock(() => {
            const lastRow = this.sheet.getLastRow()
            if (lastRow <= 1) {
                // 0件の場合は取得しない
                return []
            }
            return this.sheet.getRange(2, 1, this.sheet.getLastRow() - 1, this.columnOrder.length + 1).getValues()
        })
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
        let stringList: string[] = []
        this.onLock(() => {
            stringList = this.getRowRange(row).getValues()[0] ?? []
        })
        return this.toEntity(stringList)
    }

    /**
     * 更新処理(上書きなため、部分変更不可)
     * @param entity 変更するデータ(row 必須)
     */
    update(entity: E): void {
        this.onLock(() => {
            this.getRowRange(entity.row).setValues([this.toStringList(entity)])
        })
    }

    /**
     * 削除処理
     * @param row 削除するrow(rowは自動で付与され、不定一意)
     */
    delete(row: number): void {
        this.onLock(() => {
            const range = this.getRowRange(row)
            range.clear()
            const d = new Array(this.columnOrder.length + 1)
            d[0] = SSRepository.DELETE_LABEL
            range.setValues([d])
        })
    }
}

type LockType = 'user' | 'script' | 'none'
declare let global: {initTables: () => void}
/**
 * SpreadsheetをDBとして利用する<br>
 * 作成したRepositoryを登録する
 */
export function useSpreadsheetDB(initGlobal: (
    global: {initTables: () => void},
    initTables: ()=>void) => void,
                                 ...repositoryList: { new (): SSRepository<any> }[]) {
    const initTables = () => {
        for (const repository of repositoryList) {
            try {
                console.info('create instances')
                const r = new repository()
                const name = r['tableName']
                console.info('start', name)
                r.initTable()
                console.info('success', name)
            }catch (e) {
                console.error('init spreadsheet error', e)
            }
        }
    }
    initGlobal(global, initTables)
}
