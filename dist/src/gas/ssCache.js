export function ssCache(spreadSheetApp, spreadsheetId, expirationInSeconds) {
    const spreadsheet = spreadSheetApp.openById(spreadsheetId);
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
//# sourceMappingURL=ssCache.js.map