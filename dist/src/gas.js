export { createGasApp, useProperties };
let useGasAPI = {};
function createGasApp(options = {}) {
    global.doGet = () => {
        const gasHtml = HtmlService.createHtmlOutputFromFile(options.htmlFileName ?? 'index');
        const htmlOutput = options.editHtmlOutput ? options.editHtmlOutput(gasHtml) : gasHtml.addMetaTag('viewport', 'width=device-width, initial-scale=1');
        if (options.onDoGet)
            options.onDoGet(htmlOutput);
        return htmlOutput;
    };
    useGasAPI = options.useGasAPI ?? {};
    return gasAppOptions;
}
const gasAppOptions = {
    useScripts(scripts, initGlobal, options = {}) {
        function wrapperScript(name) {
            return async (args) => {
                if (options.onBeforeScript)
                    options.onBeforeScript(args);
                const returnValue = await scripts[name](args);
                if (options.onAfterScript)
                    options.onAfterScript(returnValue);
                return { json: JSON.stringify(returnValue) };
            };
        }
        initGlobal(global, wrapperScript);
        return this;
    },
    useSpreadsheetCache() {
        // TODO
        return this;
    },
    useSpreadsheetDB() {
        // TODO
        return this;
    },
};
/**
 * Properties read/write	50,000 / day
 */
function useProperties() {
    return {
        document: {
            getProperties: PropertiesService.getDocumentProperties().getProperties,
            deleteAllProperties: PropertiesService.getDocumentProperties().deleteAllProperties,
            getKeys: PropertiesService.getDocumentProperties().getKeys,
            setProperties: (properties) => {
                return PropertiesService.getDocumentProperties().setProperties(properties);
            },
            getProperty: (key) => {
                return PropertiesService.getDocumentProperties().getProperty(key);
            },
            setProperty: (key, value) => {
                return PropertiesService.getDocumentProperties().setProperty(key, value);
            },
            deleteProperty: (key) => {
                PropertiesService.getDocumentProperties().deleteProperty(key);
            },
        },
        script: {
            getProperties: PropertiesService.getScriptProperties().getProperties,
            deleteAllProperties: PropertiesService.getScriptProperties().deleteAllProperties,
            getKeys: PropertiesService.getScriptProperties().getKeys,
            setProperties: (properties) => {
                return PropertiesService.getScriptProperties().setProperties(properties);
            },
            getProperty: (key) => {
                return PropertiesService.getScriptProperties().getProperty(key);
            },
            setProperty: (key, value) => {
                return PropertiesService.getScriptProperties().setProperty(key, value);
            },
            deleteProperty: (key) => {
                PropertiesService.getScriptProperties().deleteProperty(key);
            },
        },
        user: {
            getProperties: PropertiesService.getUserProperties().getProperties,
            deleteAllProperties: PropertiesService.getUserProperties().deleteAllProperties,
            getKeys: PropertiesService.getUserProperties().getKeys,
            setProperties: (properties) => {
                return PropertiesService.getUserProperties().setProperties(properties);
            },
            getProperty: (key) => {
                return PropertiesService.getUserProperties().getProperty(key);
            },
            setProperty: (key, value) => {
                return PropertiesService.getUserProperties().setProperty(key, value);
            },
            deleteProperty: (key) => {
                PropertiesService.getUserProperties().deleteProperty(key);
            },
        }
    };
}
export class NotionClient {
    _apiBaseUrl = 'https://api.notion.com/v1';
    _authToken;
    _urlFetchApp;
    constructor(authToken) {
        this._authToken = authToken;
        if (useGasAPI.urlFetchApp) {
            this._urlFetchApp = useGasAPI.urlFetchApp;
        }
        else {
            throw 'not found UrlFetchApp. run "createGasApp({useGasAPI})"';
        }
    }
    static createToken() {
        // TODO GAS Oauth2を利用する
        //  https://qiita.com/Qnoir/items/98741f6b4266e6960b9d
        //  https://developers.notion.com/reference/create-a-token
        return '';
    }
    createHeaders() {
        return {
            Authorization: `Bearer ${this._authToken}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        };
    }
    async fetch(path, options) {
        const url = this._apiBaseUrl + path;
        let resp = this._urlFetchApp.fetch(url, options);
        if (resp.getResponseCode() === 429) {
            await new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 2000);
            });
            resp = this._urlFetchApp.fetch(url, options);
        }
        if (resp.getResponseCode() === 200) {
            return JSON.parse(resp.getContentText());
        }
        throw resp.getContentText();
    }
    get blocks() {
        return {
            append() { },
            get() { },
            list() { },
            update() { },
            delete() { },
        };
    }
    get pages() {
        return {
            create: async (body) => {
                return this.fetch('/pages', {
                    headers: this.createHeaders(),
                    method: 'post',
                    payload: JSON.stringify(body),
                    muteHttpExceptions: true,
                });
            },
            get: async (pageId) => {
                return this.fetch(`/pages/${pageId}`, {
                    headers: this.createHeaders(),
                    method: 'get',
                    muteHttpExceptions: true,
                });
            },
            getProperty: async (pageId, propertyId) => {
                return this.fetch(`/pages/${pageId}/properties/${propertyId}`, {
                    headers: this.createHeaders(),
                    method: 'get',
                    muteHttpExceptions: true,
                });
            },
            updateProperty: async (pageId, body) => {
                return this.fetch(`/pages/${pageId}`, {
                    headers: this.createHeaders(),
                    method: 'patch',
                    payload: JSON.stringify(body),
                    muteHttpExceptions: true,
                });
            },
            archive() { },
        };
    }
    get databases() {
        return {
            create() {
            },
            query: async (databaseId, body = {}) => {
                let cursor = undefined;
                let result = [];
                while (true) {
                    const payload = Object.assign(body, { start_cursor: cursor });
                    const resp = await this.fetch(`/databases/${databaseId}/query`, {
                        headers: this.createHeaders(),
                        method: 'post',
                        payload: JSON.stringify(payload),
                        muteHttpExceptions: true,
                    });
                    result = result.concat(resp.results);
                    if (resp.has_more) {
                        cursor = resp.next_cursor;
                    }
                    else {
                        return result;
                    }
                }
            },
            get() {
            },
            update() {
            },
            updateProperty() {
            },
        };
    }
    get users() {
        return {
            get() { },
            list() { },
            getBot() { },
        };
    }
    get comments() {
        return {
            create() { },
            get() { },
        };
    }
    get search() {
        return {
            searchByTitle() { },
        };
    }
}
/**
 * スプレッドシートをテーブルとしてCRUD操作を行う<br>
 * 本abstract classをextendsして作成する<br>
 * extendsしたクラスをgasInit().useSpreadsheetDBに入力すると利用可能となる<br>
 * extendsしたクラスをインスタンス化して利用する
 */
export class SSRepository {
    _sheet;
    importSheet() {
        const spreadsheet = this.spreadSheetApp.openById(this.spreadsheetId);
        return spreadsheet.getSheetByName(this.tableName) ?? undefined;
    }
    get sheet() {
        if (!this._sheet) {
            this._sheet = this.importSheet();
            if (this._sheet) {
                if (this.checkRequiredUpdate(this._sheet)) {
                    throw `not updated Sheet "${this.tableName}" gas editor run "initTables"`;
                }
                else {
                    return this._sheet;
                }
            }
            throw `not found Sheet "${this.tableName}" gas editor run "initTables"`;
        }
        else {
            return this._sheet;
        }
    }
    static TABLE_VERSION_LABEL = 'ver:';
    static DELETE_LABEL = 'DELETE';
    static ROW_FUNCTION = '=row()';
    /**
     * テーブル作成(アップデート)時、初期にInsertされるデータ
     * @protected
     */
    initData = [];
    /**
     * SpreadsheetApp(OAuth スコープ回避のため)
     * @protected
     */
    spreadSheetApp = useGasAPI.spreadsheetApp ?? (() => {
        throw 'not found SpreadsheetApp. run "createGasApp({useGasAPI})"';
    })();
    /**
     * トランザクションタイプ(LockService参照) default: user
     */
    lockType = 'user';
    /**
     * トランザクションロック開放を待つ時間(ミリ秒)
     */
    lockWaitMSec = 10000;
    checkRequiredUpdate(sheet) {
        return sheet.getRange(1, 1, 1, 1).getValue() !== SSRepository.TABLE_VERSION_LABEL + this.tableVersion;
    }
    createTable(sheet) {
        // DataRangeが1行より多い場合、データはあると判断
        if (sheet.getDataRange().getValues().length > 1) {
            const oldVersion = sheet.getRange(1, 1, 1, 1).getValue();
            const oldSheet = sheet.copyTo(this.spreadSheetApp.openById(this.spreadsheetId));
            const oldName = sheet.getName() + ' version:' + oldVersion;
            oldSheet.setName(oldName);
            sheet.clear();
        }
        // バージョン情報をセット
        sheet.getRange(1, 1, 1, 1).setValue(SSRepository.TABLE_VERSION_LABEL + this.tableVersion);
        //ヘッダーをセット
        sheet.getRange(1, 2, 1, this.columnOrder.length).setValues([this.columnOrder]);
        //初期データをインサート
        for (const e of this.initData) {
            this.insert(e);
        }
    }
    toStringList(entity) {
        const result = [];
        result.push(SSRepository.ROW_FUNCTION);
        for (const key of this.columnOrder) {
            const value = entity[key] ?? '';
            result.push(JSON.stringify(value));
        }
        return result;
    }
    toEntity(stringList) {
        const entity = {
            row: stringList[0],
        };
        for (let i = 1; i < stringList.length; i++) {
            const key = this.columnOrder[i - 1];
            entity[key] = JSON.parse(stringList[i] ?? '');
        }
        return entity;
    }
    getRowRange(rowNumber) {
        return this.sheet.getRange(rowNumber, 1, 1, this.columnOrder.length + 1);
    }
    onLock(runningInLock) {
        if (this.lockType === 'none')
            return runningInLock();
        const lock = this.lockType === 'user' ? LockService.getUserLock() : LockService.getScriptLock();
        try {
            lock.waitLock(this.lockWaitMSec);
            const result = runningInLock();
            this.spreadSheetApp.flush();
            return result;
        }
        finally {
            lock.releaseLock();
        }
    }
    /**
     * gas console上で動作させるinitTables()で利用される
     */
    initTable() {
        // シートがない場合生成する必要がある
        const spreadsheet = this.spreadSheetApp.openById(this.spreadsheetId);
        const sheet = spreadsheet.getSheetByName(this.tableName);
        this._sheet = sheet ? sheet : spreadsheet.insertSheet().setName(this.tableName);
        if (this.checkRequiredUpdate(this._sheet)) {
            this.createTable(this._sheet);
        }
    }
    /**
     * 挿入処理
     * @param entity 挿入するデータ。rowの有無は任意(利用せず、新規rowが付与される)
     * @return 挿入したデータのrow
     */
    insert(entity) {
        return this.onLock(() => {
            let insertRowNumber = -1;
            const values = this.sheet.getDataRange().getValues();
            for (let i = 1; i < values.length; i++) {
                if ((values[i] ?? [])[0] === SSRepository.DELETE_LABEL) {
                    insertRowNumber = i + 1;
                    break;
                }
            }
            const insertData = this.toStringList(entity);
            if (insertRowNumber === -1) {
                // 最後尾に挿入
                this.sheet.appendRow(insertData);
                return values.length + 1;
            }
            else {
                // 削除行に挿入
                this.getRowRange(insertRowNumber).setValues([insertData]);
                return insertRowNumber;
            }
        });
    }
    /**
     * 全件取得(フィルターなどはJSで実施)
     */
    getAll() {
        let values;
        values = this.onLock(() => {
            const lastRow = this.sheet.getLastRow();
            if (lastRow <= 1) {
                // 0件の場合は取得しない
                return [];
            }
            return this.sheet.getRange(2, 1, this.sheet.getLastRow() - 1, this.columnOrder.length + 1).getValues();
        });
        const entities = [];
        for (const value of values) {
            if (!value[0])
                break;
            if (value[0] === SSRepository.DELETE_LABEL)
                continue;
            entities.push(this.toEntity(value));
        }
        return entities;
    }
    /**
     * １件取得
     * @param row 取得するrow(rowは自動で付与され、不定一意)
     */
    getByRow(row) {
        let stringList = [];
        this.onLock(() => {
            stringList = this.getRowRange(row).getValues()[0] ?? [];
        });
        return this.toEntity(stringList);
    }
    /**
     * 更新処理(上書きなため、部分変更不可)
     * @param entity 変更するデータ(row 必須)
     */
    update(entity) {
        this.onLock(() => {
            this.getRowRange(entity.row).setValues([this.toStringList(entity)]);
        });
    }
    /**
     * 削除処理
     * @param row 削除するrow(rowは自動で付与され、不定一意)
     */
    delete(row) {
        this.onLock(() => {
            const range = this.getRowRange(row);
            range.clear();
            const d = new Array(this.columnOrder.length + 1);
            d[0] = SSRepository.DELETE_LABEL;
            range.setValues([d]);
        });
    }
}
/**
 * SpreadsheetをDBとして利用する<br>
 * 作成したRepositoryを登録する
 */
export function useSpreadsheetDB(initGlobal, ...repositoryList) {
    const initTables = () => {
        for (const repository of repositoryList) {
            try {
                console.info('create instances');
                const r = new repository();
                const name = r['tableName'];
                console.info('start', name);
                r.initTable();
                console.info('success', name);
            }
            catch (e) {
                console.error('init spreadsheet error', e);
            }
        }
    };
    initGlobal(global, initTables);
}
/*--------------------------------------------------------------------------------------------------------------------*/
export function spreadsheetCache(spreadsheetId, expirationInSeconds) {
    if (!useGasAPI.spreadsheetApp)
        throw 'not found SpreadsheetApp. run "createGasApp({useGasAPI})"';
    const spreadsheet = useGasAPI.spreadsheetApp.openById(spreadsheetId);
    const tempSheet = spreadsheet.getSheetByName('cache');
    const sheet = tempSheet ? tempSheet : spreadsheet.insertSheet().setName('cache');
    return {
        get: (rowNumber) => {
            const expiration = Number.parseInt(sheet.getRange(rowNumber, 1, 1, 1).getValue(), 10);
            if (!expiration) {
                return null;
            }
            if (expirationInSeconds && (Date.now() - expiration) / 1000 > expirationInSeconds) {
                return null;
            }
            const table = sheet.getRange(rowNumber, 2, 1, sheet.getLastColumn()).getValues();
            let text = '';
            for (const row of table) {
                for (const col of row) {
                    if (col) {
                        text += col.toString();
                    }
                    else {
                        break;
                    }
                }
            }
            return JSON.parse(text);
        },
        set: (rowNumber, data) => {
            // ※1セル50000文字制限のため、余裕を持って45000
            let json = JSON.stringify(data);
            const chunks = [Date.now()];
            while (json.length > 0) {
                chunks.push(json.substring(0, 45000));
                json = json.substring(45000);
            }
            const range = sheet.getRange(rowNumber, 1, 1, chunks.length);
            range.setValues([chunks]);
        },
        clear: (rowNumber) => {
            sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).clear();
        }
    };
}
//# sourceMappingURL=gas.js.map