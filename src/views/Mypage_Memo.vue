<template>
  <v-container>
    <v-content>
      <h1>マイメモ</h1>

      <v-layout row align-center justify-start class="ma-2">
        <div>
          <v-avatar>
            <v-img v-if="currentUser.photoURL" :src="currentUser.photoURL"></v-img>
            <v-icon v-else>person</v-icon>
          </v-avatar>
          <div class="ma-2">{{currentUser.displayName}}</div>
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
        @input="loading=false;"
      ></v-textarea>
      <v-card v-show="!memoEdit" class="my-2 mb-5 pa-3" :min-height="310" v-html="compiledMarkdown"></v-card>

      <v-checkbox v-model="memo_info.readonly" :label="'読み取りのみ'" :hide-details="true" class="ma-1"></v-checkbox>
      <v-btn dark class="blue-grey" @click="shareMemo()">
        シェアメモ投稿する
        <v-icon right dark>cloud_upload</v-icon>
      </v-btn>

      <v-btn fab fixed bottom right v-on:click="deleteMemo()" class="error">
        <v-icon dark style="height: auto;">delete</v-icon>
      </v-btn>
    </v-content>
  </v-container>
</template>


<script>
import marked from "marked";
import firebase from 'firebase/app';
import "firebase/auth"
import "firebase/database"

export default {
  name: "Mypage_Memo",
  data() {
    return this.init();
  },
  // メモ初期表示とメモ同期
  beforeRouteEnter(route, redirect, next) {
    console.log("Mypage_Memo_beforeRouteEnter");
    next(vm => {
      vm.before(vm, null, vm.$route.params.memoid);
    });
  },
  // メモ表示再利用とメモ同期
  beforeRouteUpdate(to, from, next) {
    console.log("Mypage_Memo_beforeRouteUpdate", this.loading);
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
    console.log("Mypage_Memo_updated", this.loading);
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
    memo_info.updated_at_desc = - this.getDateTime();

    console.log("メモ更新[uid:" + uid + "][memoid:" + memoid + "]", memo_info);
    this.loading = false;
    firebase
      .database()
      .ref("/users/" + uid + "/memos/" + memoid + "/memo_info")
      .update(memo_info)
      .then(res => {
        console.log("メモ更新完了[" + memoid + "]", res);
        this.loading = true;
      });
  },
  beforeRouteLeave(to, from, next) {
    console.log("beforeRouteLeave", this.loading);

    var memoid = this.$route.params.memoid;

    if (!firebase.auth().currentUser) {
      next();
      return;
    }

    if (!this.memo_info) {
      var uid = firebase.auth().currentUser.uid;
      firebase
        .database()
        .ref("/users/" + uid + "/memos/" + memoid)
        .remove()
        .then(res => {
          console.log("メモ削除完了", res);
          next();
        });
    } else {
      next();
    }
  },
  methods: {
    init() {
      return {
        currentUser: firebase.auth().currentUser,
        initLoading: false,
        loading: false,
        memo_info: {
          memo: "",
          readonly: false,
          viewcnt: 0,
          viewcnt_desc: 0
        },
        memoEdit: true
      };
    },
    before(vm, next, memoid) {
      // リセット
      Object.assign(vm.$data, vm.init());

      if (!firebase.auth().currentUser) {
        vm.$router.push({ path: "/" });
        if (next) {
          next();
        }
        return;
      }

      if (!memoid) {
        vm.addMemo(vm);
        if (next) {
          next();
        }
        return;
      }

      var uid = firebase.auth().currentUser.uid;
      console.log("マイメモ取得＆同期[uid:" + uid + "][memoid:" + memoid + "]");
      vm.loading = false;
      firebase
        .database()
        .ref("/users/" + uid + "/memos/" + memoid + "/memo_info")
        .on("value", snapshot => {
          console.log("マイメモ取得＆同期完了", snapshot);
          var uid = firebase.auth().currentUser.uid;
          var memo_info = snapshot.val() || null;

          if (!memo_info) {
            vm.$router.push({ path: "/" });

          } else {
            vm.memo_info = memo_info;

            if (!vm.initLoading) {
              vm.initLoading = true;

              memo_info.viewcnt += 1;
              memo_info.viewcnt_desc = - memo_info.viewcnt;
              console.log("マイメモ初期更新[uid:${uid}][memoid:${memoid}]");
              firebase
                .database()
                .ref("/users/" + uid + "/memos/" + memoid + "/memo_info")
                .update(memo_info)
                .then(res => {
                  console.log("マイメモ初期更新完了[" + memoid + "]", res);
                });
            }
          }

          vm.loading = true;
          if (next) {
            next();
          }
        });
    },
    // マイメモ新規保存
    addMemo(vm) {
      console.log("addMemo", vm);
      var uid = firebase.auth().currentUser.uid;
      var memo_info = vm.memo_info;

      memo_info.created_uid = uid;
      memo_info.created_at = this.getDateTime();
      memo_info.created_at_desc = - this.getDateTime();
      memo_info.updated_uid = uid;
      memo_info.updated_at = this.getDateTime();
      memo_info.updated_at_desc =  - this.getDateTime();

      console.log("マイメモ新規保存[uid:" + uid + "]", memo_info);
      vm.loading = false;
      firebase
        .database()
        .ref("users/" + uid + "/memos")
        .push({ memo_info: memo_info })
        .then(res => {
          console.log("マイメモ新規保存完了", res);
          var memoid = res.key;
          vm.$router.push({ path: "/mypage/memos/" + memoid });
        });
    },
    // シェアメモ投稿する
    shareMemo() {
      console.log("shareMemo");
      if (!window.confirm("シェアメモ投稿しますか？")) {
        return;
      }

      var uid = firebase.auth().currentUser.uid;
      var memo_info = this.memo_info;
      memo_info.viewcnt = 0;
      memo_info.viewcnt_desc = 0;
      memo_info.created_uid = uid;
      memo_info.created_at = this.getDateTime();
      memo_info.created_desc = - this.getDateTime();

      console.log("シェアメモ新規保存[uid:" + uid + "]", memo_info);
      this.loading = false;
      firebase
        .database()
        .ref("memos")
        .push({ memo_info: memo_info })
        .then(res => {
          console.log("シェアメモ新規保存完了", res);
          this.$router.push({ path: "/" });
        });
    },
    // メモ削除
    deleteMemo() {
      if (window.confirm("メモを削除しますか？")) {
        this.memo_info = null;
        this.$router.push({ path: "/" });
      }
    }
  }
};
</script>
