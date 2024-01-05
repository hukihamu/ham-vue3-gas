export { BaseScriptType };
interface BaseScriptType {
    [scriptName: string]: (args: any) => unknown;
}
