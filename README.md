# memomemo
メモ共有サイト

# 環境
- Node.js　v10.15.0
- Vue.js　　2.9.6
- Firebase　6.3.1

# 環境構築

## windowsにNode.jsをインストール
推奨版をインストール  
https://nodejs.org/ja/

Node.jsのバージョン確認  
https://qiita.com/strsk/items/925644e124efcc964625
```bash
> node -v
v10.15.0
```

## npmにVue.jsインストール

```
> npm install -g vue-cli

> vue -V
2.9.6
```

# Vueプロジェクトを作成
Enter×5、No×3、npmを選択してEnter
```bash
> vue init webpack memomemo

? Project name memomemo
? Project description A Vue.js project
? Author okdyy75 <okdyy75@gmail.com>
? Vue build standalone
? Install vue-router? Yes
? Use ESLint to lint your code? No
? Set up unit tests No
? Setup e2e tests with Nightwatch? No
? Should we run `npm install` for you after the project has been created? (recommended) npm
```

「 To get started」で以下のコマンドを実行
```bash
To get started:

  cd memomemo
  npm run dev
```

正常にVue画面が表示されたら、gitにコミット


``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

# Firebaseプロジェクトを作成

Firebaseコンソールからプロジェクトを作成  
https://console.firebase.google.com/


Firebase ツールをインストール
```bash
> npm install -g firebase-tools
```

Google にログインする
```bash
> firebase login
```

Firebaseプロジェクト作成
```bash
> firebase init
```

どのFirebase CLI機能を使うかSpaceキーを押して選択  
Hostingを選択してEnter
```bash
? Which Firebase CLI features do you want to setup for this folder? Press Space to select features, then Enter to confi
rm your choices.
 ( ) Database: Deploy Firebase Realtime Database Rules
 ( ) Firestore: Deploy rules and create indexes for Firestore
 ( ) Functions: Configure and deploy Cloud Functions
>(*) Hosting: Configure and deploy Firebase Hosting sites
 ( ) Storage: Deploy Cloud Storage security rules
```

コンソールから作成したプロジェクトを選択
```bash
? Select a default Firebase project for this directory:
  [don't setup a default project]
  fir-84a0c (Firebase)
> memomemo-e1fe0 (memomemo)
  [create a new project]
```

- Hostingの公開ディレクトリ(public)にするか聞かれているので、「dist」にしてEnter
- SPA（シングルページアプリケーション）として設定（すべてのURLを/index.htmlにアクセス）するか
聞かれているので、そのままEnter
- index.htmlを上書きするか聞かれているので「No」でEnter
```bash
? What do you want to use as your public directory? dist
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
? File dist/index.html already exists. Overwrite? No
```

Firebaseの初期化が完了
```bash
+  Firebase initialization complete!
```

ここでgitにコミット


## Firebaseプロジェクト設定
Firebaseコンソールの「Authentication」から「ウェブ設定」ボタンを押下し、スクリプトタグをコピー
/dist/index.htmlの「<div id="app"></div>」直下にペースト
```
  <body>
    <div id="app"></div>
    <script src="https://www.gstatic.com/firebasejs/5.8.2/firebase.js"></script>
    ...
```

## Vueプロジェクト設定

「webpack.config.js」ファイルを設定
```js
    publicPath: '/dist/',
>    publicPath: '/', // 更新

...
  devServer: {
    contentBase: 'dist', // 追加

...
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
>    new webpack.optimize.UglifyJsPlugin({
>      sourceMap: false,

```

「../dist」ディレクトリを作成し、そこにinde.html を移動  
inde.html の build.js 読み込み部分を下記に編集
```
<script src="./build.js"></script>
```



## 作成したFirebaseプロジェクトを公開

各種設定後、Firebaseプロジェクトを一度デプロイ  
正常に公開されているかHosting URLにアクセス
```
> npm run build

...
> firebase deploy

Project Console: https://console.firebase.google.com/project/memomemo-e1fe0/overview
Hosting URL: https://memomemo-e1fe0.firebaseapp.com
```

正常にデプロイ出来ていたら、gitにコミット


## Vue Routerのインストール
```
> npm install vue-router
```

# FirebaseUI導入

  <script src="https://www.gstatic.com/firebasejs/ui/3.5.2/firebase-ui-auth__ja.js"></script>
  <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/3.5.2/firebase-ui-auth.css" />
  
npm install firebase@>=5.0.0


$ npm install firebaseui --save

var firebase = require('firebase');
var firebaseui = require('firebaseui');

npm install --save firebase firebaseui vue-router

npm install shitajicss


[公式リファレンス](https://firebase.google.com/docs/auth/web/firebaseui?hl=ja)


https://github.com/firebase/firebaseui-web


