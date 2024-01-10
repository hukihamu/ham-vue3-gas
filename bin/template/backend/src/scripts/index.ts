import {AsyncScriptType} from 'ham-vue3-gas/gas'
import {SampleScripts} from '@ham-vue3-gas/shared/dist/src/scripts'
import {gasSample} from '@/scripts/gasSample'

export type WrapperScriptType = AsyncScriptType<SampleScripts>
export const scripts: WrapperScriptType = {
    gasSample,
}