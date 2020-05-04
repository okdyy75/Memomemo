# MemoMemo
メモ共有サイト  
[MemoMemo](https://memomemo-e1fe0.firebaseapp.com)  


## 概要
プライベート・共有メモの作成  
マークダウン記法でも可能  
SNSログインまたはゲストログインが必須  
ゲストログイン後、SNSログインした際はSNSログインに統合される。  
同じメールアドレスのSNSログインをした場合ははじかれる。  
共有メモは［編集・閲覧数］、［更新が新しい］順で並び替え可能。  


## 画面URL

| 画面名 | URL |
|:------------------------|:-----------------------|
|トップ                   | /                      |
|マイページ/メモ作成・編集  | /mypage/memos/:memoid  |
|シェアメモ編集            | /memos/:memoid         |

## DB構成
|                        |                               |
|:-----------------------|:------------------------------|
|ユーザー情報             | /users/:uid                   |
|ユーザーメモ             | /users/:uid/memos/:memoid     |
|共有メモ                 | /memos/:memoid               |
|共有メモの編集中ユーザー  | /memos/:memoid/edit_users     |


```json
{
  "users" : {
    ":uid" : {
      "user_info" : {
        "created_at" : "yyyymmddhhmmss",
        "created_uid" : ":uid",
        "displayName" : "Yuya Okada（SNS表示名）",
        "loginProviderId" : "github.com（SNSホスト）",
        "photoURL" : "https://avatars3.githubusercontent.com/u/31526134?v=4（SNSアイコン画像）",
        "updated_at" : "yyyymmddhhmmss",
        "updated_uid" : ":uid"
      },
      "memos" : {
        ":memoid" : {
          "memo_info" : {
            "created_at" : "yyyymmddhhmmss",
            "created_at_desc" : "-yyyymmddhhmmss",
            "created_desc" : "-yyyymmddhhmmss",
            "created_uid" : ":uid",
            "memo" : "（メモ内容）",
            "readonly" : false,
            "updated_at" : "yyyymmddhhmmss",
            "updated_at_desc" : "-yyyymmddhhmmss",
            "updated_uid" : ":uid",
            "viewcnt" : 1,
            "viewcnt_desc" : -1
          },
        },
      }
    }
  },
  "memos" : {
    ":memoid" : {
      "memo_info" : {
        "memo" : "（メモ内容）",
        "readonly" : false,
        "created_at" : "yyyy/mm/dd hh/mm/ss",
        "created_uid" : ":uid",
        "updated_at" : "yyyy/mm/dd hh/mm/ss",
        "updated_uid" : ":uid",
        "viewcnt" : 0
      },
      "edit_users" : {
        ":uid" : {
          "displayName" : "users.displayName",
          "photoURL" : "users.photoURL"
        }
      }
    }
  }
}
```

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

## 作成したFirebaseプロジェクトを公開

各種設定後、Firebaseプロジェクトを一度デプロイ  
正常に公開されているかHosting URLにアクセス
```bash
> npm run build
> firebase deploy
```

正常にデプロイ出来ていたらOK

# プロジェクトの設定


```bash
# Vue Routerのインストール
> npm install vue-router --save

# firebaseのインストール
$ npm install firebase --save

# firebase-uiのインストール
# [FirebaseUI公式リファレンス](https://github.com/firebase/firebaseui-web)
> npm install firebaseui --save

# firebase-ui日本語化のインストール
> npm install firebaseui-ja --save

var firebase = require("firebase");
var firebaseui = require("firebaseui-ja");
require("firebaseui-ja/dist/firebaseui.css");

# Vuetifyのインストール
npm install vuetify --save

# 日付処理ライブラリのインストール
npm install moment -save

# マテリアルデザインアイコンのインストール
# https://github.com/jossef/material-design-icons-iconfont
npm install material-design-icons-iconfont --save

# マークダウンライブラリのインストール
> npm install marked -g --save

コンソールからRealtime Database作成

～
+  Firebase initialization complete!

```

# ローカル開発環境
1. 「config/dev.env.js」に環境変数を設定する
2. `npm run dev`