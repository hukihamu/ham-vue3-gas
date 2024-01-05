import {BaseScriptType} from './share'
import * as notion from './gas/notion'
import * as spreadsheet from './gas/spreadsheet'
export {createGasApp, AsyncScriptType, useProperties, notion, spreadsheet}

declare let global: { [name: string]: unknown }

/**
 * URL Fetch calls	20,000 / day
 */
type GasAPI = {
    urlFetchApp?: GoogleAppsScript.URL_Fetch.UrlFetchApp
    spreadsheetApp?: GoogleAppsScript.Spreadsheet.SpreadsheetApp
    session?: GoogleAppsScript.Base.Session
}
type CreateOptions = {
    htmlFileName?: string
    editHtmlOutput?: (output: GoogleAppsScript.HTML.HtmlOutput) => GoogleAppsScript.HTML.HtmlOutput
    useGasAPI?: GasAPI
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
    useScripts: <T extends AsyncScriptType<BaseScriptType>>(scripts: T, initGlobal: (global: { [K in keyof T]?: WrapperScript<T[K]> }, wrapperScript: <K extends keyof T>(name: Exclude<K, ''>)=> WrapperScript<T[K]>) => void, options: UseScriptsOptions) => GasAppOptions
    useSpreadsheetDB: () => GasAppOptions
    useSpreadsheetCache: () => GasAppOptions
}
let useGasAPI: GasAPI = {}

function createGasApp(options: CreateOptions = {}): GasAppOptions {

    global.doGet = () => {
        const gasHtml = HtmlService.createHtmlOutputFromFile(options.htmlFileName ?? 'index')
        const htmlOutput = options.editHtmlOutput ? options.editHtmlOutput(gasHtml) : gasHtml.addMetaTag('viewport', 'width=device-width, initial-scale=1')
        if (options.onDoGet) options.onDoGet(htmlOutput)
        return htmlOutput
    }
    useGasAPI = options.useGasAPI ?? {}

    return gasAppOptions
}

const gasAppOptions: GasAppOptions = {
    useScripts<T extends AsyncScriptType<BaseScriptType>>(
        scripts: T,
        initGlobal: (global: { [K in keyof T]?: WrapperScript<T[K]> }, wrapperScript: <K extends keyof T>(name: Exclude<K, ''>)=> WrapperScript<T[K]>) => void,
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
    useSpreadsheetCache() {
        // TODO
        return this
    },
    useSpreadsheetDB() {
        // TODO
        return this
    },
}
type AsyncScriptType<T extends BaseScriptType> = {
    [K in keyof T]: (args: Parameters<T[K]>[0]) => Promise<ReturnType<T[K]>>
}
type WrapperScript<S extends (args: any) => any> = (args: Parameters<S>[0]) => Promise<{json: string}>

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

