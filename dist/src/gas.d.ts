/// <reference types="google-apps-script" />
/// <reference types="google-apps-script" />
/// <reference types="google-apps-script" />
/// <reference types="google-apps-script" />
import { BaseScriptType } from './share';
import * as notion from './gas/notion';
import * as spreadsheet from './gas/spreadsheet';
export { createGasApp, AsyncScriptType, useProperties, notion, spreadsheet };
/**
 * URL Fetch calls	20,000 / day
 */
type GasAPI = {
    urlFetchApp?: GoogleAppsScript.URL_Fetch.UrlFetchApp;
    spreadsheetApp?: GoogleAppsScript.Spreadsheet.SpreadsheetApp;
    session?: GoogleAppsScript.Base.Session;
};
type CreateOptions = {
    htmlFileName?: string;
    editHtmlOutput?: (output: GoogleAppsScript.HTML.HtmlOutput) => GoogleAppsScript.HTML.HtmlOutput;
    useGasAPI?: GasAPI;
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
    }, wrapperScript: <K extends keyof T>(name: Exclude<K, ''>) => WrapperScript<T[K]>) => void, options: UseScriptsOptions) => GasAppOptions;
    useSpreadsheetDB: () => GasAppOptions;
    useSpreadsheetCache: () => GasAppOptions;
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
