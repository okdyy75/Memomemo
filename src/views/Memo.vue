<template>
  <v-container>
    <v-content>
      <h1>シェアメモ</h1>
      <small>※シェアメモは削除できません</small>

      <br>
      <br>
      <small v-if="memo_info.readonly" class="caption d-block">このメモは読み取り専用です</small>
      <v-layout row class="ma-2">
        <div>
          <v-avatar>
            <v-img v-if="memo_user.photoURL" :src="memo_user.photoURL"></v-img>
            <v-icon v-else>person</v-icon>
          </v-avatar>
          <div class="ma-2">{{memo_user.displayName}}</div>
        </div>
        <div>
          <v-layout column class="ml-2">
            <div>作成 {{getDateTimeFormat(memo_info.created_at)}}</div>
            <div>更新 {{getDateTimeFormat(memo_info.updated_at)}}</div>
            <div>閲覧・更新数 {{memo_info.viewcnt}}</div>
            <div>
              <v-btn class="primary" :disabled="memoEdit" @click="memoEdit=!memoEdit">編集</v-btn>
              <v-btn class="primary" :disabled="!memoEdit" @click="memoEdit=!memoEdit">表示</v-btn>
            </div>
          </v-layout>
        </div>
      </v-layout>

      <v-textarea
        solo
        auto-grow
        v-show="memoEdit"
        v-model="memo_info.memo"
        :row-height="60"
        :readonly="memo_info.readonly"
        :box="memo_info.readonly"
        @input="loading=false;"
      ></v-textarea>

      <v-card v-show="!memoEdit" class="my-2 mb-5 pa-3" :min-height="310" v-html="compiledMarkdown"></v-card>
      <v-snackbar v-model="snackbar" :timeout="0" multi-line class="pa-0">
        <v-layout row align-center>
          <div class="ma-1">
            編集
            <br>閲覧中
          </div>
          <div v-for="(edit_user, index) in edit_users" :key="index">
            <v-layout column class="text-xs-center">
              <v-avatar>
                <v-img v-if="edit_user.photoURL" :src="edit_user.photoURL"></v-img>
                <v-icon v-else>person</v-icon>
              </v-avatar>
              <small center>{{edit_user.displayName}}</small>
            </v-layout>
          </div>
        </v-layout>
      </v-snackbar>
    </v-content>
  </v-container>
</template>


<script>
import marked from "marked";
var firebase = require("firebase");

export default {
  name: "Memo",
  data() {
    return this.init();
  },
  // メモ初期表示とメモ同期
  beforeRouteEnter(route, redirect, next) {
    console.log("Memo_beforeRouteEnter");
    next(vm => {
      vm.before(vm, null, vm.$route.params.memoid);
    });
  },
  // メモ表示再利用とメモ同期
  beforeRouteUpdate(to, from, next) {
    console.log("Memo_beforeRouteUpdate", this.loading);
    this.before(this, next, to.params.memoid);
  },
  // 同期更新
  computed: {
    compiledMarkdown: function() {
      return marked(this.memo_info.memo);
    }
  },
  // メモを常に同期保存
  updated() {
    console.log(
      "Memo_updated",
      this.loading,
      this.$route.params.memoid,
      this.memo_info.memo
    );
    var memoid = this.$route.params.memoid;

    if (this.loading) {
      return;
    }
    if (!memoid) {
      return;
    }
    if (!this.memo_info.memo) {
      return;
    }

    // メモ更新
    var uid = firebase.auth().currentUser.uid;

    var memo_info = this.memo_info;

    memo_info.updated_uid = uid;
    memo_info.updated_at = this.getDateTime();
    memo_info.updated_at_desc = -this.getDateTime();

    console.log("メモ更新[uid:" + uid + "][memoid:" + memoid + "]", memo_info);
    this.loading = true;
    firebase
      .database()
      .ref("/memos/" + memoid + "/memo_info")
      .update(memo_info)
      .then(res => {
        this.loading = true;
        console.log("メモ更新完了[" + memoid + "]", res);
      });
  },
  beforeRouteLeave(to, from, next) {
    console.log("beforeRouteLeave", this.loading);
    var memoid = this.$route.params.memoid;

    if (!memoid || !firebase.auth().currentUser) {
      next();
      return;
    }

    var uid = firebase.auth().currentUser.uid;
    this.loading = false;

    firebase
      .database()
      .ref("/memos/" + memoid + "/edit_users/" + uid)
      .remove()
      .then(res => {
        console.log("メモの編集者削除完了", res);
        this.loading = true;
        next();
      });
  },
  methods: {
    init() {
      return {
        loading: false,
        snackbar: true,
        memo_info: {
          memo: "",
          readonly: false,
          viewcnt: 0,
          viewcnt_desc: 0
        },
        memo_user: {},
        edit_users: {},
        memoEdit: true
      };
    },
    before(vm, next, memoid) {
      // リセット
      Object.assign(vm.$data, vm.init());

      if (!memoid || !firebase.auth().currentUser) {
        vm.$router.push({ path: "/" });
        if (next) {
          next();
        }
        return;
      }

      var uid = firebase.auth().currentUser.uid;
      console.log("シェアメモ取得＆同期[uid:${uid}][memoid:${memoid}]");
      vm.loading = false;

      var fbDB = firebase.database();

      fbDB.ref("/memos/" + memoid + "/memo_info").on("value", memoSnap => {
        console.log("シェアメモ取得＆同期完了", memoSnap);
        var memo_info = memoSnap.val();
        var memo_user = {};

        if (!memo_info) {
          vm.$router.push({ path: "/" });
        } else {
          vm.memo_info = memo_info;

          if (!vm.initLoading) {
            vm.initLoading = true;

            console.log("シェアメモ登録ユーザー取得");
            fbDB
              .ref("users/" + memo_info.created_uid + "/user_info")
              .once("value")
              .then(userSnap => {
                console.log("シェアメモ登録ユーザー取得完了", userSnap);
                memo_user = userSnap.val();
                if (memo_user) {
                  vm.memo_user = memo_user;
                }
              });

            memo_info.viewcnt += 1;
            memo_info.viewcnt_desc = - memo_info.viewcnt;
            console.log("シェアメモ初期更新[memoid:" + memoid + "]");
            fbDB
              .ref("/memos/" + memoid + "/memo_info")
              .update(memo_info)
              .then(res => {
                console.log("シェアメモ初期更新完了[" + memoid + "]", res);
              });

            console.log("シェアメモ編集中ユーザー登録");
            fbDB
              .ref("/memos/" + memoid + "/edit_users/" + uid)
              .update({
                displayName: firebase.auth().currentUser.displayName,
                photoURL: firebase.auth().currentUser.photoURL
              })
              .then(res => {
                console.log("シェアメモ編集中ユーザー更新完了[${uid}]", res);

                console.log("シェアメモ編集中ユーザー取得＆同期");
                fbDB
                  .ref("/memos/" + memoid + "/edit_users/")
                  .on("value", snapshot => {
                    console.log(
                      "シェアメモ編集中ユーザー取得＆同期完了",
                      snapshot
                    );
                    var edit_users = snapshot.val() || null;
                    vm.edit_users = edit_users;
                  });
              });
          }
        }

        vm.loading = true;
        if (next) {
          next();
        }
      });
    }
  }
};
</script>

<style>
div.v-snack__wrapper {
  width: 100%;
  max-width: 100%;
}
.v-snack--multi-line .v-snack__content {
  padding: 12px;
}
</style>
