var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
export { createGasApp, useProperties };
var useGasAPI = {};
function createGasApp(options) {
    var _a;
    if (options === void 0) { options = {}; }
    global.doGet = function () {
        var _a;
        var gasHtml = HtmlService.createHtmlOutputFromFile((_a = options.htmlFileName) !== null && _a !== void 0 ? _a : 'index');
        var htmlOutput = options.editHtmlOutput ? options.editHtmlOutput(gasHtml) : gasHtml.addMetaTag('viewport', 'width=device-width, initial-scale=1');
        if (options.onDoGet)
            options.onDoGet(htmlOutput);
        return htmlOutput;
    };
    useGasAPI = (_a = options.useGasAPI) !== null && _a !== void 0 ? _a : {};
    return gasAppOptions;
}
var gasAppOptions = {
    useScripts: function (scripts, initGlobal, options) {
        if (options === void 0) { options = {}; }
        function wrapperScript(name) {
            var _this = this;
            return function (args) { return __awaiter(_this, void 0, void 0, function () {
                var returnValue;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (options.onBeforeScript)
                                options.onBeforeScript(args);
                            return [4 /*yield*/, scripts[name](args)];
                        case 1:
                            returnValue = _a.sent();
                            if (options.onAfterScript)
                                options.onAfterScript(returnValue);
                            return [2 /*return*/, { json: JSON.stringify(returnValue) }];
                    }
                });
            }); };
        }
        initGlobal(global, wrapperScript);
        return this;
    },
    useSpreadsheetCache: function () {
        // TODO
        return this;
    },
    useSpreadsheetDB: function () {
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
            setProperties: function (properties) {
                return PropertiesService.getDocumentProperties().setProperties(properties);
            },
            getProperty: function (key) {
                return PropertiesService.getDocumentProperties().getProperty(key);
            },
            setProperty: function (key, value) {
                return PropertiesService.getDocumentProperties().setProperty(key, value);
            },
            deleteProperty: function (key) {
                PropertiesService.getDocumentProperties().deleteProperty(key);
            },
        },
        script: {
            getProperties: PropertiesService.getScriptProperties().getProperties,
            deleteAllProperties: PropertiesService.getScriptProperties().deleteAllProperties,
            getKeys: PropertiesService.getScriptProperties().getKeys,
            setProperties: function (properties) {
                return PropertiesService.getScriptProperties().setProperties(properties);
            },
            getProperty: function (key) {
                return PropertiesService.getScriptProperties().getProperty(key);
            },
            setProperty: function (key, value) {
                return PropertiesService.getScriptProperties().setProperty(key, value);
            },
            deleteProperty: function (key) {
                PropertiesService.getScriptProperties().deleteProperty(key);
            },
        },
        user: {
            getProperties: PropertiesService.getUserProperties().getProperties,
            deleteAllProperties: PropertiesService.getUserProperties().deleteAllProperties,
            getKeys: PropertiesService.getUserProperties().getKeys,
            setProperties: function (properties) {
                return PropertiesService.getUserProperties().setProperties(properties);
            },
            getProperty: function (key) {
                return PropertiesService.getUserProperties().getProperty(key);
            },
            setProperty: function (key, value) {
                return PropertiesService.getUserProperties().setProperty(key, value);
            },
            deleteProperty: function (key) {
                PropertiesService.getUserProperties().deleteProperty(key);
            },
        }
    };
}
var NotionClient = /** @class */ (function () {
    function NotionClient(authToken) {
        this._apiBaseUrl = 'https://api.notion.com/v1';
        this._authToken = authToken;
        if (useGasAPI.urlFetchApp) {
            this._urlFetchApp = useGasAPI.urlFetchApp;
        }
        else {
            throw 'not found UrlFetchApp. run "createGasApp({useGasAPI})"';
        }
    }
    NotionClient.createToken = function () {
        // TODO GAS Oauth2を利用する
        //  https://qiita.com/Qnoir/items/98741f6b4266e6960b9d
        //  https://developers.notion.com/reference/create-a-token
        return '';
    };
    NotionClient.prototype.createHeaders = function () {
        return {
            Authorization: "Bearer ".concat(this._authToken),
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
        };
    };
    NotionClient.prototype.fetch = function (path, options) {
        return __awaiter(this, void 0, void 0, function () {
            var url, resp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = this._apiBaseUrl + path;
                        resp = this._urlFetchApp.fetch(url, options);
                        if (!(resp.getResponseCode() === 429)) return [3 /*break*/, 2];
                        return [4 /*yield*/, new Promise(function (resolve) {
                                setTimeout(function () {
                                    resolve();
                                }, 2000);
                            })];
                    case 1:
                        _a.sent();
                        resp = this._urlFetchApp.fetch(url, options);
                        _a.label = 2;
                    case 2:
                        if (resp.getResponseCode() === 200) {
                            return [2 /*return*/, JSON.parse(resp.getContentText())];
                        }
                        throw resp.getContentText();
                }
            });
        });
    };
    Object.defineProperty(NotionClient.prototype, "blocks", {
        get: function () {
            return {
                append: function () { },
                get: function () { },
                list: function () { },
                update: function () { },
                delete: function () { },
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotionClient.prototype, "pages", {
        get: function () {
            var _this = this;
            return {
                create: function (body) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, this.fetch('/pages', {
                                headers: this.createHeaders(),
                                method: 'post',
                                payload: JSON.stringify(body),
                                muteHttpExceptions: true,
                            })];
                    });
                }); },
                get: function (pageId) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, this.fetch("/pages/".concat(pageId), {
                                headers: this.createHeaders(),
                                method: 'get',
                                muteHttpExceptions: true,
                            })];
                    });
                }); },
                getProperty: function (pageId, propertyId) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, this.fetch("/pages/".concat(pageId, "/properties/").concat(propertyId), {
                                headers: this.createHeaders(),
                                method: 'get',
                                muteHttpExceptions: true,
                            })];
                    });
                }); },
                updateProperty: function (pageId, body) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, this.fetch("/pages/".concat(pageId), {
                                headers: this.createHeaders(),
                                method: 'patch',
                                payload: JSON.stringify(body),
                                muteHttpExceptions: true,
                            })];
                    });
                }); },
                archive: function () { },
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotionClient.prototype, "databases", {
        get: function () {
            var _this = this;
            return {
                create: function () {
                },
                query: function (databaseId, body) {
                    if (body === void 0) { body = {}; }
                    return __awaiter(_this, void 0, void 0, function () {
                        var cursor, result, payload, resp;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    cursor = undefined;
                                    result = [];
                                    _a.label = 1;
                                case 1:
                                    if (!true) return [3 /*break*/, 3];
                                    payload = Object.assign(body, { start_cursor: cursor });
                                    return [4 /*yield*/, this.fetch("/databases/".concat(databaseId, "/query"), {
                                            headers: this.createHeaders(),
                                            method: 'post',
                                            payload: JSON.stringify(payload),
                                            muteHttpExceptions: true,
                                        })];
                                case 2:
                                    resp = _a.sent();
                                    result = result.concat(resp.results);
                                    if (resp.has_more) {
                                        cursor = resp.next_cursor;
                                    }
                                    else {
                                        return [2 /*return*/, result];
                                    }
                                    return [3 /*break*/, 1];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                },
                get: function () {
                },
                update: function () {
                },
                updateProperty: function () {
                },
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotionClient.prototype, "users", {
        get: function () {
            return {
                get: function () { },
                list: function () { },
                getBot: function () { },
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotionClient.prototype, "comments", {
        get: function () {
            return {
                create: function () { },
                get: function () { },
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NotionClient.prototype, "search", {
        get: function () {
            return {
                searchByTitle: function () { },
            };
        },
        enumerable: false,
        configurable: true
    });
    return NotionClient;
}());
export { NotionClient };
/**
 * スプレッドシートをテーブルとしてCRUD操作を行う<br>
 * 本abstract classをextendsして作成する<br>
 * extendsしたクラスをgasInit().useSpreadsheetDBに入力すると利用可能となる<br>
 * extendsしたクラスをインスタンス化して利用する
 */
var SSRepository = /** @class */ (function () {
    function SSRepository() {
        var _a;
        /**
         * テーブル作成(アップデート)時、初期にInsertされるデータ
         * @protected
         */
        this.initData = [];
        /**
         * SpreadsheetApp(OAuth スコープ回避のため)
         * @protected
         */
        this.spreadSheetApp = (_a = useGasAPI.spreadsheetApp) !== null && _a !== void 0 ? _a : (function () {
            throw 'not found SpreadsheetApp. run "createGasApp({useGasAPI})"';
        })();
        /**
         * トランザクションタイプ(LockService参照) default: user
         */
        this.lockType = 'user';
        /**
         * トランザクションロック開放を待つ時間(ミリ秒)
         */
        this.lockWaitMSec = 10000;
    }
    SSRepository.prototype.importSheet = function () {
        var _a;
        var spreadsheet = this.spreadSheetApp.openById(this.spreadsheetId);
        return (_a = spreadsheet.getSheetByName(this.tableName)) !== null && _a !== void 0 ? _a : undefined;
    };
    Object.defineProperty(SSRepository.prototype, "sheet", {
        get: function () {
            if (!this._sheet) {
                this._sheet = this.importSheet();
                if (this._sheet) {
                    if (this.checkRequiredUpdate(this._sheet)) {
                        throw "not updated Sheet \"".concat(this.tableName, "\" gas editor run \"initTables\"");
                    }
                    else {
                        return this._sheet;
                    }
                }
                throw "not found Sheet \"".concat(this.tableName, "\" gas editor run \"initTables\"");
            }
            else {
                return this._sheet;
            }
        },
        enumerable: false,
        configurable: true
    });
    SSRepository.prototype.checkRequiredUpdate = function (sheet) {
        return sheet.getRange(1, 1, 1, 1).getValue() !== SSRepository.TABLE_VERSION_LABEL + this.tableVersion;
    };
    SSRepository.prototype.createTable = function (sheet) {
        // DataRangeが1行より多い場合、データはあると判断
        if (sheet.getDataRange().getValues().length > 1) {
            var oldVersion = sheet.getRange(1, 1, 1, 1).getValue();
            var oldSheet = sheet.copyTo(this.spreadSheetApp.openById(this.spreadsheetId));
            var oldName = sheet.getName() + ' version:' + oldVersion;
            oldSheet.setName(oldName);
            sheet.clear();
        }
        // バージョン情報をセット
        sheet.getRange(1, 1, 1, 1).setValue(SSRepository.TABLE_VERSION_LABEL + this.tableVersion);
        //ヘッダーをセット
        sheet.getRange(1, 2, 1, this.columnOrder.length).setValues([this.columnOrder]);
        //初期データをインサート
        for (var _i = 0, _a = this.initData; _i < _a.length; _i++) {
            var e = _a[_i];
            this.insert(e);
        }
    };
    SSRepository.prototype.toStringList = function (entity) {
        var _a;
        var result = [];
        result.push(SSRepository.ROW_FUNCTION);
        for (var _i = 0, _b = this.columnOrder; _i < _b.length; _i++) {
            var key = _b[_i];
            var value = (_a = entity[key]) !== null && _a !== void 0 ? _a : '';
            result.push(JSON.stringify(value));
        }
        return result;
    };
    SSRepository.prototype.toEntity = function (stringList) {
        var _a;
        var entity = {
            row: stringList[0],
        };
        for (var i = 1; i < stringList.length; i++) {
            var key = this.columnOrder[i - 1];
            entity[key] = JSON.parse((_a = stringList[i]) !== null && _a !== void 0 ? _a : '');
        }
        return entity;
    };
    SSRepository.prototype.getRowRange = function (rowNumber) {
        return this.sheet.getRange(rowNumber, 1, 1, this.columnOrder.length + 1);
    };
    SSRepository.prototype.onLock = function (runningInLock) {
        if (this.lockType === 'none')
            return runningInLock();
        var lock = this.lockType === 'user' ? LockService.getUserLock() : LockService.getScriptLock();
        try {
            lock.waitLock(this.lockWaitMSec);
            var result = runningInLock();
            this.spreadSheetApp.flush();
            return result;
        }
        finally {
            lock.releaseLock();
        }
    };
    /**
     * gas console上で動作させるinitTables()で利用される
     */
    SSRepository.prototype.initTable = function () {
        // シートがない場合生成する必要がある
        var spreadsheet = this.spreadSheetApp.openById(this.spreadsheetId);
        var sheet = spreadsheet.getSheetByName(this.tableName);
        this._sheet = sheet ? sheet : spreadsheet.insertSheet().setName(this.tableName);
        if (this.checkRequiredUpdate(this._sheet)) {
            this.createTable(this._sheet);
        }
    };
    /**
     * 挿入処理
     * @param entity 挿入するデータ。rowの有無は任意(利用せず、新規rowが付与される)
     * @return 挿入したデータのrow
     */
    SSRepository.prototype.insert = function (entity) {
        var _this = this;
        return this.onLock(function () {
            var _a;
            var insertRowNumber = -1;
            var values = _this.sheet.getDataRange().getValues();
            for (var i = 1; i < values.length; i++) {
                if (((_a = values[i]) !== null && _a !== void 0 ? _a : [])[0] === SSRepository.DELETE_LABEL) {
                    insertRowNumber = i + 1;
                    break;
                }
            }
            var insertData = _this.toStringList(entity);
            if (insertRowNumber === -1) {
                // 最後尾に挿入
                _this.sheet.appendRow(insertData);
                return values.length + 1;
            }
            else {
                // 削除行に挿入
                _this.getRowRange(insertRowNumber).setValues([insertData]);
                return insertRowNumber;
            }
        });
    };
    /**
     * 全件取得(フィルターなどはJSで実施)
     */
    SSRepository.prototype.getAll = function () {
        var _this = this;
        var values;
        values = this.onLock(function () {
            var lastRow = _this.sheet.getLastRow();
            if (lastRow <= 1) {
                // 0件の場合は取得しない
                return [];
            }
            return _this.sheet.getRange(2, 1, _this.sheet.getLastRow() - 1, _this.columnOrder.length + 1).getValues();
        });
        var entities = [];
        for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
            var value = values_1[_i];
            if (!value[0])
                break;
            if (value[0] === SSRepository.DELETE_LABEL)
                continue;
            entities.push(this.toEntity(value));
        }
        return entities;
    };
    /**
     * １件取得
     * @param row 取得するrow(rowは自動で付与され、不定一意)
     */
    SSRepository.prototype.getByRow = function (row) {
        var _this = this;
        var stringList = [];
        this.onLock(function () {
            var _a;
            stringList = (_a = _this.getRowRange(row).getValues()[0]) !== null && _a !== void 0 ? _a : [];
        });
        return this.toEntity(stringList);
    };
    /**
     * 更新処理(上書きなため、部分変更不可)
     * @param entity 変更するデータ(row 必須)
     */
    SSRepository.prototype.update = function (entity) {
        var _this = this;
        this.onLock(function () {
            _this.getRowRange(entity.row).setValues([_this.toStringList(entity)]);
        });
    };
    /**
     * 削除処理
     * @param row 削除するrow(rowは自動で付与され、不定一意)
     */
    SSRepository.prototype.delete = function (row) {
        var _this = this;
        this.onLock(function () {
            var range = _this.getRowRange(row);
            range.clear();
            var d = new Array(_this.columnOrder.length + 1);
            d[0] = SSRepository.DELETE_LABEL;
            range.setValues([d]);
        });
    };
    SSRepository.TABLE_VERSION_LABEL = 'ver:';
    SSRepository.DELETE_LABEL = 'DELETE';
    SSRepository.ROW_FUNCTION = '=row()';
    return SSRepository;
}());
export { SSRepository };
/**
 * SpreadsheetをDBとして利用する<br>
 * 作成したRepositoryを登録する
 */
export function useSpreadsheetDB(initGlobal) {
    var repositoryList = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        repositoryList[_i - 1] = arguments[_i];
    }
    var initTables = function () {
        for (var _i = 0, repositoryList_1 = repositoryList; _i < repositoryList_1.length; _i++) {
            var repository = repositoryList_1[_i];
            try {
                console.info('create instances');
                var r = new repository();
                var name_1 = r['tableName'];
                console.info('start', name_1);
                r.initTable();
                console.info('success', name_1);
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
    var spreadsheet = useGasAPI.spreadsheetApp.openById(spreadsheetId);
    var tempSheet = spreadsheet.getSheetByName('cache');
    var sheet = tempSheet ? tempSheet : spreadsheet.insertSheet().setName('cache');
    return {
        get: function (rowNumber) {
            var expiration = Number.parseInt(sheet.getRange(rowNumber, 1, 1, 1).getValue(), 10);
            if (!expiration) {
                return null;
            }
            if (expirationInSeconds && (Date.now() - expiration) / 1000 > expirationInSeconds) {
                return null;
            }
            var table = sheet.getRange(rowNumber, 2, 1, sheet.getLastColumn()).getValues();
            var text = '';
            for (var _i = 0, table_1 = table; _i < table_1.length; _i++) {
                var row = table_1[_i];
                for (var _a = 0, row_1 = row; _a < row_1.length; _a++) {
                    var col = row_1[_a];
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
        set: function (rowNumber, data) {
            // ※1セル50000文字制限のため、余裕を持って45000
            var json = JSON.stringify(data);
            var chunks = [Date.now()];
            while (json.length > 0) {
                chunks.push(json.substring(0, 45000));
                json = json.substring(45000);
            }
            var range = sheet.getRange(rowNumber, 1, 1, chunks.length);
            range.setValues([chunks]);
        },
        clear: function (rowNumber) {
            sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).clear();
        }
    };
}
//# sourceMappingURL=ham-gas.js.map