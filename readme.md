# Ham-Vue3-Gas
※alpha版のため、動作保証できません。
## TODO 
- apps scriptのmock
- NotionClientの未実装関数
## How to use
1. create project folder
2. move to project folder
3. install
```powershell
npm exec -y git+https://github.com/hukihamu/ham-vue3-gas.git <project-name?>
```
4. `.clasp.json`の`scriptId`をデプロイ先のスクリプトIDに変更する
5. enjoy(^^♪)


## How to develop
1. run npm script
```powershell
npm run dev-backed
npm run dev-fronted
npm run dev-shared
```

## How to build and deploy
1. copy manifest file
```powershell
npm run cp-manifest
```
2. run npm script
```powershell
npm run build-backed
npm run build-fronted
npm run build-shared
npm run push:watch
```

## reference
- [Vue3](https://v3.vuejs.org/)
- [Vue Router](https://next.router.vuejs.org/) 
- [Pinia](https://pinia.esm.dev/)
- [Apps Script](https://developers.google.com/apps-script)
- [Vuetify3](https://vuetifyjs.com/ja/)
- [Notion API](https://developers.notion.com/)
- [@google/clasp](https://www.npmjs.com/package/@google/clasp)
### root
- .clasp.json
  - claspの設定ファイル
  - `scriptId`にデプロイ先のスクリプトIDを設定する
### shared
- src/scripts.ts
  - frontendがbackendの関数を利用するために定義する
  - `BaseScriptType` を継承したインターフェースを定義する
### fronted
- index.html
- src/main.ts
  - frontendのエントリーポイント
  - `createApp` でVueインスタンスを生成する
  - 各プラグインをインストールする
  - `mount` でVueインスタンスをマウントする(sampleは`#app`)
- src/components
  - Vueコンポーネントを定義する
  - sampleはgasから`gasSample`を呼び出している
- src/store
  - piniaのストアを定義する
- src/router
  - VueRouterのルーターを定義する
  - gasデプロイ時のルーティングはURL末尾`#`で行われる
- src/pages
  - VueRouterのページを定義する
- src/scripts.ts
  - frontendがbackendの関数を利用するための変数を作成する
  - `useScripts`で作成可能
- src/errorHandlingPlugin.ts
  - エラーハンドリングプラグイン
  - main.tsで登録する 
### backed
- mock-server.js
  - ローカルで動作確認するためのモックサーバー
- manifest/appsscript.json
  - デプロイするためのmanifestファイル
- src/index.ts
  - backendのエントリーポイント
  - `createGasApp` でgasのインスタンスを生成する
    -  appsScriptの各APIを利用する場合は`options`の`useGasAPI`を指定する
    - frontendの関数を利用する場合は`useScripts`を指定する
    - spreadsheetをDBライクに利用する場合は`useSpreadsheetDB`を指定する
    - ※`global`変数に値を入れる記述をしないと、gasの関数が実行されない(例: `global.gasSample = wrapperScript('gasSample')`)
- src/scripts/index.ts
  - frontendがbackendの関数を利用するための変数を作成する
  - sharedで作成したインターフェースをasync化する必要がある
    - `AsyncScriptType`を利用する(sampleではWrapperScriptTypeにまとめている)
- src/scripts/gasSample.ts
  - backendの関数を定義する
  - `AsyncScriptType`で定義した関数である必要がある
#### lib
- SpreadsheetDB
  - SSRepository
    - SpreadsheetDBのRepository
    - `SSRepository`を継承したクラスを作成する
  - SSEntity
    - SpreadsheetDBのEntity
    - `SSEntity`を継承したクラスを作成する
- NotionClient 
  - NotionのClient
  - **※UrlFetchAppを利用しているため、gasの制限に注意**
- SpreadsheetCache
  - Spreadsheetを用いたCache
  - `spreadsheetCache`で作成可能
- useProperties
  - 環境変数を利用するためのラッパー変数
  - `useProperties`で作成可能
  - **※PropertiesServiceを利用しているため、gasの制限に注意**
##### SpreadsheetDBとSpreadsheetCacheの違い
- 保管方法
  - SpreadsheetDB > 1データ1セルで保管する
  - SpreadsheetCache > 全データ1行で保管する
- 全テータ取得速度
  - SpreadsheetDB > 遅い
  - SpreadsheetCache > 速い
- 1データ取得方法
  - SpreadsheetDB > 行数を用いて直接取得
  - SpreadsheetCache > 全データを取得してからfind等で取得
- 1データ取得速度
  - SpreadsheetDB > 速い
  - SpreadsheetCache > 普通~遅い
- トランザクション影響範囲
  - SpreadsheetDB > 1データ or 1行
  - SpreadsheetCache > 全データ