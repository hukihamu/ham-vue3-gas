/// <reference types="google-apps-script" />
/// <reference types="google-apps-script" />
/// <reference types="google-apps-script" />
import { BaseScriptType } from './share';
export { createGasApp, AsyncScriptType, useProperties };
type CreateOptions = {
    htmlFileName?: string;
    editHtmlOutput?: (output: GoogleAppsScript.HTML.HtmlOutput) => GoogleAppsScript.HTML.HtmlOutput;
    onDoGet?: (htmlOutput: GoogleAppsScript.HTML.HtmlOutput) => void;
};
type UseScriptsOptions = {
    onBeforeScript?: (args: any) => void;
    onAfterScript?: (returnValue: any) => void;
};
type GasAppOptions = {
    /**
     * Script runtime	6 min / execution
     * Simultaneous executions per user	30 / user
     * Simultaneous executions per script	1,000
     */
    useScripts: <T extends AsyncScriptType<BaseScriptType>>(scripts: T, initGlobal: (global: {
        [K in keyof T]?: WrapperScript<T[K]>;
    }, wrapperScript: <K extends keyof T>(name: Exclude<K, ''>) => WrapperScript<T[K]>) => void, options?: UseScriptsOptions) => GasAppOptions;
    useSpreadsheetDB: (initGlobal: (global: {
        initTables: () => void;
    }, initTables: () => void) => void, ...repositoryList: {
        new (): SSRepository<any>;
    }[]) => GasAppOptions;
};
declare function createGasApp(options?: CreateOptions): GasAppOptions;
type AsyncScriptType<T extends BaseScriptType> = {
    [K in keyof T]: (args: Parameters<T[K]>[0]) => Promise<ReturnType<T[K]>>;
};
type WrapperScript<S extends (args: any) => any> = (args: Parameters<S>[0]) => Promise<{
    json: string;
}>;
/**
 * Properties read/write	50,000 / day
 */
declare function useProperties<K extends string>(): {
    document: {
        getProperties: () => {
            [key: string]: string;
        };
        deleteAllProperties: () => GoogleAppsScript.Properties.Properties;
        getKeys: () => string[];
        setProperties: (properties: {
            K: string;
        }) => GoogleAppsScript.Properties.Properties;
        getProperty: (key: K) => string | null;
        setProperty: (key: K, value: string) => GoogleAppsScript.Properties.Properties;
        deleteProperty: (key: K) => void;
    };
    script: {
        getProperties: () => {
            [key: string]: string;
        };
        deleteAllProperties: () => GoogleAppsScript.Properties.Properties;
        getKeys: () => string[];
        setProperties: (properties: {
            K: string;
        }) => GoogleAppsScript.Properties.Properties;
        getProperty: (key: K) => string | null;
        setProperty: (key: K, value: string) => GoogleAppsScript.Properties.Properties;
        deleteProperty: (key: K) => void;
    };
    user: {
        getProperties: () => {
            [key: string]: string;
        };
        deleteAllProperties: () => GoogleAppsScript.Properties.Properties;
        getKeys: () => string[];
        setProperties: (properties: {
            K: string;
        }) => GoogleAppsScript.Properties.Properties;
        getProperty: (key: K) => string | null;
        setProperty: (key: K, value: string) => GoogleAppsScript.Properties.Properties;
        deleteProperty: (key: K) => void;
    };
};
type DatabaseQueryParams = {
    filter?: any;
    sorts?: any[];
    page_size?: number;
};
type PageCreateParams = {
    parent: {
        page_id: string;
    } | {
        database_id: string;
    };
    properties: any;
    children?: any[] | string;
    icon?: any;
    cover?: any;
};
type PageUpdatePropertiesParams = {
    properties?: any;
    archived?: boolean;
    icon?: any;
    cover?: any;
};
export declare class NotionClient {
    private readonly _apiBaseUrl;
    private readonly _authToken;
    private readonly _urlFetchApp;
    constructor(authToken: string, urlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp);
    private createHeaders;
    private fetch;
    pages: {
        create: (body: PageCreateParams) => Promise<any>;
        get: (pageId: string) => Promise<any>;
        getProperty: (pageId: string, propertyId: string) => Promise<any>;
        updateProperty: (pageId: string, body: PageUpdatePropertiesParams) => Promise<any>;
    };
    databases: {
        query: (databaseId: string, body?: DatabaseQueryParams) => Promise<any>;
    };
}
/**
 * SSRepositoryのinitData、columnListの宣言に使用
 */
export type InitEntity<E extends SSEntity> = Omit<E, 'row'>;
/**
 * スプレッドシートに格納するデータオブジェクトを定義
 */
export type SSEntity = {
    row: number;
};
/**
 * スプレッドシートをテーブルとしてCRUD操作を行う<br>
 * 本abstract classをextendsして作成する<br>
 * extendsしたクラスをgasInit().useSpreadsheetDBに入力すると利用可能となる<br>
 * extendsしたクラスをインスタンス化して利用する
 */
export declare abstract class SSRepository<E extends SSEntity> {
    private _sheet;
    private importSheet;
    private get sheet();
    private static readonly TABLE_VERSION_LABEL;
    private static readonly DELETE_LABEL;
    private static readonly ROW_FUNCTION;
    /**
     * テーブルバージョン<br>
     * 変更を行うと、旧テーブルをバックアップし、新しくテーブル生成を行う<br>
     * columnList、initData、Entity変更時にバージョンを上げる
     * @protected
     */
    protected abstract readonly tableVersion: number;
    /**
     * スプレッドシートに保存する際のカラム順を決める
     * @protected
     */
    protected abstract readonly columnOrder: (keyof InitEntity<E>)[];
    /**
     * テーブル作成(アップデート)時、初期にInsertされるデータ
     * @protected
     */
    protected readonly initData: InitEntity<E>[];
    /**
     * データ格納に利用するスプレッドシートID(d/{スプレッドシートID}/edit)
     * @protected
     */
    protected abstract readonly spreadsheetId: string;
    /**
     * テーブル名(シート名)
     * @protected
     */
    protected abstract readonly tableName: string;
    /**
     * SpreadsheetApp(OAuth スコープ回避のため)
     * @protected
     */
    protected abstract readonly spreadSheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp;
    /**
     * トランザクションタイプ(LockService参照) default: user
     */
    lockType: LockType;
    /**
     * トランザクションロック開放を待つ時間(ミリ秒)
     */
    lockWaitMSec: number;
    private checkRequiredUpdate;
    private createTable;
    private toStringList;
    private toEntity;
    private getRowRange;
    useLock<R>(runningInLock: () => R): R;
    /**
     * gas console上で動作させるinitTables()で利用される
     */
    initTable(): void;
    /**
     * 挿入処理
     * @param entity 挿入するデータ。rowの有無は任意(利用せず、新規rowが付与される)
     * @return 挿入したデータのrow
     */
    insert(entity: E | InitEntity<E>): number;
    /**
     * 全件取得(フィルターなどはJSで実施)
     */
    getAll(): E[];
    /**
     * １件取得
     * @param row 取得するrow(rowは自動で付与され、不定一意)
     */
    getByRow(row: number): E;
    /**
     * 更新処理(上書きなため、部分変更不可)
     * @param entity 変更するデータ(row 必須)
     */
    update(entity: E): void;
    /**
     * 削除処理
     * @param row 削除するrow(rowは自動で付与され、不定一意)
     */
    delete(row: number): void;
}
type LockType = 'user' | 'script' | 'none';
export declare function spreadsheetCache(spreadsheetId: string, spreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp, expirationInSeconds?: number): {
    get(rowNumber: number): any;
    set(rowNumber: number, data: any): void;
    clear(rowNumber: number): void;
};
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
export declare function dispatchUpdateEvent(spreadsheetId: string, spreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp, updateEventRowNumber: number): void;
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
export declare function checkUpdateEvent(spreadsheetId: string, spreadsheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp, finalUpdateTimestamp: number, updateEventRowNumber: number): number | undefined;
