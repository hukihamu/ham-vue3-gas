/// <reference types="google-apps-script" />
export declare function ssCache(spreadSheetApp: GoogleAppsScript.Spreadsheet.SpreadsheetApp, spreadsheetId: string, expirationInSeconds?: number): {
    get: (rowNumber: number) => any;
    set: (rowNumber: number, data: any) => void;
    clear: (rowNumber: number) => void;
};
