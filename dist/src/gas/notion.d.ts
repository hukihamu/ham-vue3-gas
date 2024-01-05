/// <reference types="google-apps-script" />
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
    private readonly _urlFetchApp;
    private readonly _apiBaseUrl;
    private readonly _authToken;
    constructor(urlFetchApp: GoogleAppsScript.URL_Fetch.UrlFetchApp, authToken: string);
    static createToken(): string;
    private createHeaders;
    private fetch;
    get blocks(): {
        append(): void;
        get(): void;
        list(): void;
        update(): void;
        delete(): void;
    };
    get pages(): {
        create: (body: PageCreateParams) => Promise<any>;
        get: (pageId: string) => Promise<any>;
        getProperty: (pageId: string, propertyId: string) => Promise<any>;
        updateProperty: (pageId: string, body: PageUpdatePropertiesParams) => Promise<any>;
        archive(): void;
    };
    get databases(): {
        create(): void;
        query: (databaseId: string, body?: DatabaseQueryParams) => Promise<any>;
        get(): void;
        update(): void;
        updateProperty(): void;
    };
    get users(): {
        get(): void;
        list(): void;
        getBot(): void;
    };
    get comments(): {
        create(): void;
        get(): void;
    };
    get search(): {
        searchByTitle(): void;
    };
}
export {};
