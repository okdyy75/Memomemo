<template>
  <v-container>
    <v-content>
      <div v-if="!isLogin">
        <Login></Login>
      </div>
      <div v-else>
        <h1>シェアメモ一覧</h1>

        <v-select
          solo
          :items="[{text: '編集・閲覧数', value: 'viewcnt_desc'}, {text: '更新が新しい', value: 'updated_at_desc'}]"
          label="並び順"
          @change="selectOrder($event)"
          class="ma-1"
        ></v-select>
        <v-list>
          <v-list-tile v-for="(memo, index) in memos" :key="index" :to="'/memos/' + memo.memoid">
            <v-list-tile-avatar>
              <v-img v-if="memo.user" :src="memo.user.photoURL"></v-img>
              <v-icon v-else>person</v-icon>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title
                v-html="memo.memo_info.memo ? memo.memo_info.memo.split(/\n/)[0] : ''"
              ></v-list-tile-title>
              <v-list-tile-sub-title v-html="memo.memo_info.memo"></v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon>remove_red_eye</v-icon>
            </v-list-tile-action>
            <v-list-tile-action-text class="ma-2">{{memo.memo_info.viewcnt}}</v-list-tile-action-text>
          </v-list-tile>
        </v-list>
      </div>
    </v-content>
  </v-container>
</template>

<script>
var firebase = require("firebase");
import Login from "@/components/Login.vue";

export default {
  name: "Home",
  components: {
    Login: Login
  },
  props: ["isLogin"],
  data() {
    return this.init();
  },
  // シェアメモ表示
  beforeRouteEnter(route, redirect, next) {
    console.log("Home_beforeRouteEnter");
    next(vm => {
      vm.before(vm, null);
    });
  },
  // シェアメモ表示
  beforeRouteUpdate(to, from, next) {
    console.log("Home_beforeRouteUpdate");
    this.before(this, next);
  },
  updated() {
    console.log("Memos_updated", this.loading);
  },
  methods: {
    init() {
      return {
        loading: false,
        order: "viewcnt_desc",
        memos: {}
      };
    },
    before(vm, next) {
      // リセット
      Object.assign(vm.$data, vm.init());
      vm.getShareMemos(vm, next);
    },
    getShareMemos(vm, next) {
      console.log("シェアメモ一覧取得");
      vm.loading = false;
      var firebaseDB = firebase.database();

      firebaseDB
        .ref("memos")
        .orderByChild("/memo_info/" + vm.order)
        .once("value", memosSnap => {
          console.log("シェアメモ一覧取得完了", memosSnap);
          var ps = [];
          memosSnap.forEach(memoSnap => {
            var memo = memoSnap.val();
            var memoid = memoSnap.key;

            ps.push(
              new Promise(function(resolve, reject) {
                firebaseDB
                  .ref("users/" + memo.memo_info.created_uid + "/user_info")
                  .once("value", userSnap => {
                    var user_info = userSnap.val();
                    var uid = userSnap.key;
                    memo.user = user_info;
                    memo.memoid = memoid;
                    resolve(memo);
                  });
              })
            );
          });
          Promise.all(ps).then(function(memos) {
            vm.memos = memos;
            if (next) {
              next();
            }
          });
        });
    },
    selectOrder(val) {
      this.order = val;
      this.getShareMemos(this);
    }
  },
  watch: {
    $route(to, from) {
      console.log("Home_watch");
    }
  }
};
</script>