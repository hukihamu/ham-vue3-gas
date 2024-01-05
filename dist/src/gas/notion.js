export class NotionClient {
    _urlFetchApp;
    _apiBaseUrl = 'https://api.notion.com/v1';
    _authToken;
    constructor(urlFetchApp, authToken) {
        this._urlFetchApp = urlFetchApp;
        this._authToken = authToken;
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
//# sourceMappingURL=notion.js.map