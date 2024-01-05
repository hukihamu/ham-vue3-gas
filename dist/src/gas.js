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
//# sourceMappingURL=gas.js.map